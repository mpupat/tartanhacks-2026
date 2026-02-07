"""
Winback XRPL Backend API
========================
Complete XRP Ledger integration for transparent, blockchain-verified cashback settlements.

Features:
- Multi-wallet system (Company, Escrow, User wallets)
- Purchase logging with escrow creation
- Prediction configuration on-chain
- Settlement with instant XRP payments
- Complete audit trail
"""

import binascii
import json
import time
import traceback
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- XRPL ASYNC IMPORTS ---
from xrpl.asyncio.clients import AsyncJsonRpcClient
from xrpl.asyncio.wallet import generate_faucet_wallet
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.models.transactions import AccountSet, Payment, Memo
from xrpl.models.requests import AccountTx, AccountInfo
from xrpl.utils import str_to_hex, ripple_time_to_datetime, xrp_to_drops, drops_to_xrp

app = FastAPI(
    title="Winback XRPL API",
    description="XRP Ledger integration for prediction-based cashback",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
XRPL_URL = "https://s.altnet.rippletest.net:51234"
client = AsyncJsonRpcClient(XRPL_URL)

# Wallet storage
COMPANY_WALLET = None
ESCROW_WALLET = None
USER_WALLETS: Dict[int, Any] = {}

# --- TRANSACTION TYPES ---
class TransactionType:
    PURCHASE = "PURCHASE"
    PREDICTION_CONFIG = "PREDICTION_CONFIG"
    POSITION_UPDATE = "POSITION_UPDATE"
    SETTLEMENT = "SETTLEMENT"
    CASHBACK_PAYMENT = "CASHBACK_PAYMENT"

# --- API DATA MODELS ---
class PurchaseRequest(BaseModel):
    user_id: int
    purchase_id: str
    item_name: str
    item_icon: str
    purchase_amount: float

class PredictionConfigRequest(BaseModel):
    user_id: int
    position_id: str
    purchase_id: str
    market_ticker: str
    market_title: str
    prediction_direction: str  # "YES" or "NO"
    entry_price: float
    max_reward_percent: float
    max_loss_percent: float
    time_limit_days: int

class SettlementRequest(BaseModel):
    user_id: int
    position_id: str
    market_ticker: str
    outcome: str  # "win" or "loss"
    entry_price: float
    final_price: float
    settlement_reason: str
    cashback_amount: float
    roi: float

# --- WALLET MANAGEMENT ---
async def initialize_wallets():
    """Initialize company and escrow wallets on startup."""
    global COMPANY_WALLET, ESCROW_WALLET
    
    if COMPANY_WALLET is None:
        print("🔄 Funding Company Wallet on Testnet...")
        COMPANY_WALLET = await generate_faucet_wallet(client)
        print(f"✅ Company Wallet: {COMPANY_WALLET.address}")
    
    if ESCROW_WALLET is None:
        print("🔄 Funding Escrow Wallet on Testnet...")
        ESCROW_WALLET = await generate_faucet_wallet(client)
        print(f"✅ Escrow Wallet: {ESCROW_WALLET.address}")

async def get_or_create_user_wallet(user_id: int):
    """Get existing user wallet or create new one."""
    if user_id not in USER_WALLETS:
        print(f"🔄 Creating wallet for user {user_id}...")
        USER_WALLETS[user_id] = await generate_faucet_wallet(client)
        print(f"✅ User {user_id} Wallet: {USER_WALLETS[user_id].address}")
    
    return USER_WALLETS[user_id]

# --- MEMO HELPERS ---
def create_memo(payload: dict, memo_type: str = "Winback_v1") -> Memo:
    """Create XRPL memo from payload."""
    return Memo(
        memo_data=str_to_hex(json.dumps(payload)),
        memo_type=str_to_hex(memo_type),
        memo_format=str_to_hex("json")
    )

def create_purchase_memo(user_id: int, purchase_data: dict) -> Memo:
    """Create memo for purchase logging."""
    payload = {
        "type": TransactionType.PURCHASE,
        "user_id": user_id,
        "purchase_id": purchase_data["purchase_id"],
        "item": purchase_data["item_name"],
        "icon": purchase_data["item_icon"],
        "amount": purchase_data["purchase_amount"],
        "timestamp": datetime.utcnow().isoformat(),
        "status": "unconfigured"
    }
    return create_memo(payload)

def create_prediction_memo(user_id: int, config: dict) -> Memo:
    """Create memo for prediction configuration."""
    payload = {
        "type": TransactionType.PREDICTION_CONFIG,
        "user_id": user_id,
        "position_id": config["position_id"],
        "purchase_id": config["purchase_id"],
        "market_ticker": config["market_ticker"],
        "market_title": config["market_title"],
        "direction": config["prediction_direction"],
        "entry_price": config["entry_price"],
        "max_reward_pct": config["max_reward_percent"],
        "max_loss_pct": config["max_loss_percent"],
        "time_limit_days": config["time_limit_days"],
        "timestamp": datetime.utcnow().isoformat()
    }
    return create_memo(payload)

def create_settlement_memo(user_id: int, settlement: dict) -> Memo:
    """Create memo for settlement."""
    payload = {
        "type": TransactionType.SETTLEMENT,
        "user_id": user_id,
        "position_id": settlement["position_id"],
        "market_ticker": settlement["market_ticker"],
        "outcome": settlement["outcome"],
        "entry_price": settlement["entry_price"],
        "final_price": settlement["final_price"],
        "settlement_reason": settlement["settlement_reason"],
        "cashback_amount": settlement["cashback_amount"],
        "roi": settlement["roi"],
        "timestamp": datetime.utcnow().isoformat()
    }
    return create_memo(payload)

# --- ROUTES ---

@app.on_event("startup")
async def startup():
    """Initialize wallets on server start."""
    await initialize_wallets()

@app.get("/")
async def root():
    """Health check and wallet status."""
    return {
        "status": "online",
        "service": "Winback XRPL API",
        "network": "testnet",
        "company_wallet": COMPANY_WALLET.address if COMPANY_WALLET else None,
        "escrow_wallet": ESCROW_WALLET.address if ESCROW_WALLET else None,
        "explorer_base": "https://testnet.xrpl.org"
    }

@app.post("/purchase/log")
async def log_purchase(req: PurchaseRequest):
    """
    Log purchase to XRPL blockchain.
    Called after user completes checkout.
    """
    try:
        await initialize_wallets()
        user_wallet = await get_or_create_user_wallet(req.user_id)
        
        # Create purchase memo
        memo = create_purchase_memo(req.user_id, req.dict())
        
        # Log purchase on company wallet
        tx = AccountSet(
            account=COMPANY_WALLET.address,
            memos=[memo]
        )
        
        response = await submit_and_wait(tx, client, COMPANY_WALLET)
        tx_hash = response.result.get("hash")
        
        return {
            "status": "success",
            "tx_hash": tx_hash,
            "explorer_url": f"https://testnet.xrpl.org/transactions/{tx_hash}",
            "user_wallet": user_wallet.address,
            "message": "Purchase logged to XRP Ledger"
        }
        
    except Exception as e:
        print(f"❌ Purchase Log Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/prediction/configure")
async def configure_prediction(req: PredictionConfigRequest):
    """
    Log prediction configuration to XRPL.
    Called when user sets up their prediction for a purchase.
    """
    try:
        await initialize_wallets()
        
        # Create prediction memo
        memo = create_prediction_memo(req.user_id, req.dict())
        
        # Log to blockchain
        tx = AccountSet(
            account=COMPANY_WALLET.address,
            memos=[memo]
        )
        
        response = await submit_and_wait(tx, client, COMPANY_WALLET)
        tx_hash = response.result.get("hash")
        
        return {
            "status": "success",
            "tx_hash": tx_hash,
            "explorer_url": f"https://testnet.xrpl.org/transactions/{tx_hash}",
            "position_id": req.position_id,
            "market_ticker": req.market_ticker,
            "direction": req.prediction_direction,
            "message": "Prediction configured on XRP Ledger"
        }
        
    except Exception as e:
        print(f"❌ Prediction Config Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/position/settle")
async def settle_position(req: SettlementRequest):
    """
    Settle position and process payment.
    - Logs settlement to blockchain
    - Pays cashback if user won
    """
    try:
        await initialize_wallets()
        user_wallet = await get_or_create_user_wallet(req.user_id)
        
        # Log settlement
        memo = create_settlement_memo(req.user_id, req.dict())
        
        tx = AccountSet(
            account=COMPANY_WALLET.address,
            memos=[memo]
        )
        
        settlement_response = await submit_and_wait(tx, client, COMPANY_WALLET)
        settlement_hash = settlement_response.result.get("hash")
        
        result = {
            "status": "success",
            "outcome": req.outcome,
            "settlement_hash": settlement_hash,
            "settlement_url": f"https://testnet.xrpl.org/transactions/{settlement_hash}",
        }
        
        # If user won, send cashback payment
        if req.outcome == "win" and req.cashback_amount > 0:
            # Convert to XRP drops (1 XRP = 1,000,000 drops)
            # For demo, we'll use a scaled amount (1 USD = 0.01 XRP)
            xrp_amount = req.cashback_amount * 0.01
            
            payment_tx = Payment(
                account=COMPANY_WALLET.address,
                destination=user_wallet.address,
                amount=xrp_to_drops(xrp_amount),
                memos=[create_memo({
                    "type": TransactionType.CASHBACK_PAYMENT,
                    "position_id": req.position_id,
                    "amount_usd": req.cashback_amount,
                    "amount_xrp": xrp_amount,
                    "roi": req.roi
                })]
            )
            
            payment_response = await submit_and_wait(payment_tx, client, COMPANY_WALLET)
            payment_hash = payment_response.result.get("hash")
            
            result["payment_hash"] = payment_hash
            result["payment_url"] = f"https://testnet.xrpl.org/transactions/{payment_hash}"
            result["cashback_xrp"] = xrp_amount
            result["message"] = f"Cashback of ${req.cashback_amount:.2f} sent!"
        
        elif req.outcome == "loss":
            result["additional_charge"] = abs(req.cashback_amount)
            result["message"] = f"Additional charge of ${abs(req.cashback_amount):.2f} applied"
        
        else:
            result["message"] = "Position settled - breakeven"
        
        return result
        
    except Exception as e:
        print(f"❌ Settlement Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/{user_id}/wallet")
async def get_user_wallet(user_id: int):
    """Get user's XRPL wallet info."""
    try:
        user_wallet = await get_or_create_user_wallet(user_id)
        
        # Get account balance
        account_request = AccountInfo(account=user_wallet.address)
        account_response = await client.request(account_request)
        
        balance_drops = account_response.result["account_data"]["Balance"]
        balance_xrp = float(drops_to_xrp(balance_drops))
        
        return {
            "user_id": user_id,
            "wallet_address": user_wallet.address,
            "balance_xrp": balance_xrp,
            "explorer_url": f"https://testnet.xrpl.org/accounts/{user_wallet.address}"
        }
        
    except Exception as e:
        print(f"❌ Wallet Info Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/{user_id}/history")
async def get_user_history(user_id: int, tx_type: Optional[str] = None):
    """
    Get user's complete blockchain history.
    Optionally filter by transaction type.
    """
    try:
        await initialize_wallets()
        
        request = AccountTx(
            account=COMPANY_WALLET.address,
            ledger_index_min=-1
        )
        
        response = await client.request(request)
        transactions = response.result.get("transactions", [])
        
        user_history = []
        
        for item in transactions:
            tx_data = item.get("tx_json", item)
            
            if "Memos" not in tx_data:
                continue
            
            for m in tx_data["Memos"]:
                try:
                    memo_content = m.get("Memo", m)
                    memo_hex = memo_content.get("MemoData")
                    
                    if not memo_hex:
                        continue
                    
                    memo_str = binascii.unhexlify(memo_hex).decode('utf-8')
                    memo_json = json.loads(memo_str)
                    
                    # Filter by user
                    if str(memo_json.get("user_id")) != str(user_id):
                        continue
                    
                    # Filter by type if specified
                    if tx_type and memo_json.get("type") != tx_type:
                        continue
                    
                    # Get transaction hash
                    tx_hash = item.get("hash") or tx_data.get("hash")
                    
                    # Convert timestamp
                    raw_date = tx_data.get("date")
                    timestamp = memo_json.get("timestamp", "Unknown")
                    if raw_date:
                        timestamp = ripple_time_to_datetime(raw_date).strftime("%Y-%m-%d %H:%M:%S")
                    
                    user_history.append({
                        "hash": tx_hash,
                        "type": memo_json.get("type"),
                        "timestamp": timestamp,
                        "explorer_url": f"https://testnet.xrpl.org/transactions/{tx_hash}",
                        "data": memo_json
                    })
                    
                except Exception:
                    continue
        
        # Sort by timestamp (newest first)
        user_history.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "user_id": user_id,
            "total_transactions": len(user_history),
            "history": user_history
        }
        
    except Exception as e:
        print(f"❌ History Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_platform_analytics():
    """Get platform-wide analytics from blockchain."""
    try:
        await initialize_wallets()
        
        request = AccountTx(
            account=COMPANY_WALLET.address,
            ledger_index_min=-1
        )
        
        response = await client.request(request)
        transactions = response.result.get("transactions", [])
        
        stats = {
            "total_purchases": 0,
            "total_predictions": 0,
            "total_settlements": 0,
            "total_wins": 0,
            "total_losses": 0,
            "total_cashback_paid": 0.0,
            "total_charges": 0.0,
            "unique_users": set()
        }
        
        for item in transactions:
            tx_data = item.get("tx_json", item)
            
            if "Memos" not in tx_data:
                continue
            
            for m in tx_data["Memos"]:
                try:
                    memo_content = m.get("Memo", m)
                    memo_hex = memo_content.get("MemoData")
                    
                    if not memo_hex:
                        continue
                    
                    memo_str = binascii.unhexlify(memo_hex).decode('utf-8')
                    memo_json = json.loads(memo_str)
                    
                    tx_type = memo_json.get("type")
                    user_id = memo_json.get("user_id")
                    
                    if user_id:
                        stats["unique_users"].add(user_id)
                    
                    if tx_type == TransactionType.PURCHASE:
                        stats["total_purchases"] += 1
                    
                    elif tx_type == TransactionType.PREDICTION_CONFIG:
                        stats["total_predictions"] += 1
                    
                    elif tx_type == TransactionType.SETTLEMENT:
                        stats["total_settlements"] += 1
                        
                        if memo_json.get("outcome") == "win":
                            stats["total_wins"] += 1
                            stats["total_cashback_paid"] += memo_json.get("cashback_amount", 0)
                        elif memo_json.get("outcome") == "loss":
                            stats["total_losses"] += 1
                            stats["total_charges"] += abs(memo_json.get("cashback_amount", 0))
                
                except Exception:
                    continue
        
        # Calculate win rate
        win_rate = 0
        if stats["total_settlements"] > 0:
            win_rate = (stats["total_wins"] / stats["total_settlements"]) * 100
        
        return {
            "total_purchases": stats["total_purchases"],
            "total_predictions": stats["total_predictions"],
            "total_settlements": stats["total_settlements"],
            "total_wins": stats["total_wins"],
            "total_losses": stats["total_losses"],
            "win_rate_percent": round(win_rate, 2),
            "total_cashback_paid": round(stats["total_cashback_paid"], 2),
            "total_charges": round(stats["total_charges"], 2),
            "net_cashback": round(stats["total_cashback_paid"] - stats["total_charges"], 2),
            "unique_users": len(stats["unique_users"]),
            "company_wallet": COMPANY_WALLET.address if COMPANY_WALLET else None
        }
        
    except Exception as e:
        print(f"❌ Analytics Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# BLOCKCHAIN EXPLORER ENDPOINTS
# ============================================

@app.get("/blockchain/status")
async def get_blockchain_status():
    """
    Get current blockchain connection status.
    Used by the Blockchain Explorer dashboard.
    """
    try:
        await initialize_wallets()
        
        # Get server info
        from xrpl.models.requests import ServerInfo
        server_info = await client.request(ServerInfo())
        
        # Get transaction count from company wallet
        tx_count = 0
        if COMPANY_WALLET:
            request = AccountTx(
                account=COMPANY_WALLET.address,
                ledger_index_min=-1,
                limit=1
            )
            response = await client.request(request)
            # The marker tells us there are more transactions
            tx_count = len(response.result.get("transactions", []))
            
            # Get full count
            full_request = AccountTx(
                account=COMPANY_WALLET.address,
                ledger_index_min=-1
            )
            full_response = await client.request(full_request)
            tx_count = len(full_response.result.get("transactions", []))
        
        validated_ledger = server_info.result.get("info", {}).get("validated_ledger", {})
        
        return {
            "connected": True,
            "network": "Testnet",
            "network_url": XRPL_URL,
            "latest_ledger": validated_ledger.get("seq", 0),
            "ledger_age_seconds": validated_ledger.get("age", 0),
            "our_transaction_count": tx_count,
            "company_wallet": COMPANY_WALLET.address if COMPANY_WALLET else None,
            "escrow_wallet": ESCROW_WALLET.address if ESCROW_WALLET else None,
            "explorer_base": "https://testnet.xrpl.org"
        }
        
    except Exception as e:
        print(f"❌ Blockchain Status Error: {e}")
        return {
            "connected": False,
            "network": "Testnet",
            "error": str(e)
        }


@app.get("/blockchain/wallets")
async def get_all_wallets():
    """
    Get info on all platform wallets.
    """
    try:
        await initialize_wallets()
        
        wallets = []
        
        # Company wallet
        if COMPANY_WALLET:
            try:
                info = await client.request(AccountInfo(
                    account=COMPANY_WALLET.address,
                    ledger_index="validated"
                ))
                tx_request = AccountTx(
                    account=COMPANY_WALLET.address,
                    ledger_index_min=-1
                )
                tx_response = await client.request(tx_request)
                
                wallets.append({
                    "type": "company",
                    "label": "Company Treasury",
                    "icon": "🏢",
                    "address": COMPANY_WALLET.address,
                    "balance_xrp": float(drops_to_xrp(info.result["account_data"]["Balance"])),
                    "transaction_count": len(tx_response.result.get("transactions", [])),
                    "purpose": "Main treasury & transaction logging",
                    "explorer_url": f"https://testnet.xrpl.org/accounts/{COMPANY_WALLET.address}"
                })
            except Exception as e:
                print(f"Company wallet error: {e}")
        
        # Escrow wallet
        if ESCROW_WALLET:
            try:
                info = await client.request(AccountInfo(
                    account=ESCROW_WALLET.address,
                    ledger_index="validated"
                ))
                
                wallets.append({
                    "type": "escrow",
                    "label": "Escrow Wallet",
                    "icon": "🔒",
                    "address": ESCROW_WALLET.address,
                    "balance_xrp": float(drops_to_xrp(info.result["account_data"]["Balance"])),
                    "transaction_count": 0,
                    "purpose": "Holds funds during prediction periods",
                    "explorer_url": f"https://testnet.xrpl.org/accounts/{ESCROW_WALLET.address}"
                })
            except Exception as e:
                print(f"Escrow wallet error: {e}")
        
        # User wallets
        user_wallet_list = []
        total_user_balance = 0
        for user_id, wallet in USER_WALLETS.items():
            try:
                info = await client.request(AccountInfo(
                    account=wallet.address,
                    ledger_index="validated"
                ))
                balance = float(drops_to_xrp(info.result["account_data"]["Balance"]))
                total_user_balance += balance
                user_wallet_list.append({
                    "user_id": user_id,
                    "address": wallet.address,
                    "balance_xrp": balance
                })
            except:
                pass
        
        return {
            "platform_wallets": wallets,
            "user_wallets": {
                "count": len(USER_WALLETS),
                "total_balance_xrp": round(total_user_balance, 2),
                "wallets": user_wallet_list[:10]  # Show first 10
            }
        }
        
    except Exception as e:
        print(f"❌ Wallets Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/blockchain/feed")
async def get_transaction_feed(limit: int = 20):
    """
    Get recent transaction feed for live display.
    """
    try:
        await initialize_wallets()
        
        if not COMPANY_WALLET:
            return {"transactions": [], "total": 0}
        
        request = AccountTx(
            account=COMPANY_WALLET.address,
            ledger_index_min=-1,
            limit=limit
        )
        response = await client.request(request)
        
        transactions = []
        transactions = []
        for tx_data in response.result.get("transactions", []):
            # Handle different XRPL server response formats
            tx = tx_data.get("tx", {})
            if not tx:
                tx = tx_data.get("transaction", {})
            if not tx:
                tx = tx_data.get("tx_json", {})
                
            meta = tx_data.get("meta", {})
            
            # Parse memo
            memo_data = {}
            memos = tx.get("Memos", [])
            if memos and len(memos) > 0:
                try:
                    memo_hex = memos[0].get("Memo", {}).get("MemoData", "")
                    if memo_hex:
                        memo_json = json.loads(binascii.unhexlify(memo_hex).decode())
                        memo_data = memo_json
                except:
                    pass
            
            tx_type = memo_data.get("type", "UNKNOWN")
            
            # Get timestamp
            timestamp = None
            if "date" in tx:
                timestamp = ripple_time_to_datetime(tx["date"]).isoformat()
            elif "close_time_iso" in tx_data:
                timestamp = tx_data["close_time_iso"]
            
            # Format transaction for feed
            parsed_tx = {
                "hash": tx.get("hash", "") or tx_data.get("hash", ""),
                "type": tx_type,
                "ledger_index": tx.get("ledger_index", 0) or tx_data.get("ledger_index", 0),
                "timestamp": timestamp,
                "validated": meta.get("TransactionResult") == "tesSUCCESS" or tx_data.get("validated", False),
                "explorer_url": f"https://testnet.xrpl.org/transactions/{tx.get('hash', '') or tx_data.get('hash', '')}",
                "data": memo_data
            }
            
            # Add type-specific display info
            if tx_type == "PURCHASE":
                parsed_tx["icon"] = "🛒"
                parsed_tx["title"] = "Purchase"
                parsed_tx["description"] = f"{memo_data.get('item_name', 'Item')} • ${memo_data.get('purchase_amount', 0):.2f}"
                parsed_tx["color"] = "blue"
            elif tx_type == "PREDICTION_CONFIG":
                parsed_tx["icon"] = "📊"
                parsed_tx["title"] = "Prediction Configured"
                parsed_tx["description"] = f"{memo_data.get('market_title', 'Market')[:40]}... • {memo_data.get('prediction_direction', '')} at {memo_data.get('entry_price', 0)}¢"
                parsed_tx["color"] = "purple"
            elif tx_type == "SETTLEMENT":
                outcome = memo_data.get("outcome", "")
                parsed_tx["icon"] = "✅" if outcome == "win" else "❌"
                parsed_tx["title"] = f"Settlement - {'WIN' if outcome == 'win' else 'LOSS'}"
                cashback = memo_data.get("cashback_amount", 0)
                parsed_tx["description"] = f"{'+'if cashback >= 0 else ''}${cashback:.2f} cashback"
                parsed_tx["color"] = "green" if outcome == "win" else "red"
            elif tx_type == "CASHBACK_PAYMENT":
                parsed_tx["icon"] = "💰"
                parsed_tx["title"] = "Cashback Paid"
                parsed_tx["description"] = f"XRP sent to user"
                parsed_tx["color"] = "gold"
            else:
                parsed_tx["icon"] = "📝"
                parsed_tx["title"] = "Transaction"
                parsed_tx["description"] = tx_type
                parsed_tx["color"] = "gray"
            
            transactions.append(parsed_tx)
        
        return {
            "transactions": transactions,
            "total": len(transactions)
        }
        
    except Exception as e:
        print(f"❌ Feed Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/blockchain/verify/{tx_hash}")
async def verify_transaction(tx_hash: str):
    """
    Verify a specific transaction by hash.
    """
    try:
        from xrpl.models.requests import Tx
        
        request = Tx(transaction=tx_hash)
        response = await client.request(request)
        
        tx = response.result
        
        # Parse memo
        memo_data = {}
        memos = tx.get("Memos", [])
        if memos and len(memos) > 0:
            try:
                memo_hex = memos[0].get("Memo", {}).get("MemoData", "")
                if memo_hex:
                    memo_json = json.loads(binascii.unhexlify(memo_hex).decode())
                    memo_data = memo_json
            except:
                pass
        
        return {
            "verified": True,
            "hash": tx_hash,
            "ledger_index": tx.get("ledger_index", 0),
            "timestamp": ripple_time_to_datetime(tx.get("date", 0)).isoformat() if tx.get("date") else None,
            "validated": tx.get("validated", False),
            "transaction_type": tx.get("TransactionType", ""),
            "account": tx.get("Account", ""),
            "destination": tx.get("Destination", ""),
            "data": memo_data,
            "explorer_url": f"https://testnet.xrpl.org/transactions/{tx_hash}"
        }
        
    except Exception as e:
        return {
            "verified": False,
            "hash": tx_hash,
            "error": str(e)
        }


@app.get("/blockchain/user/{user_id}/trail")
async def get_user_blockchain_trail(user_id: int):
    """
    Get a user's complete blockchain trail.
    """
    try:
        await initialize_wallets()
        
        if not COMPANY_WALLET:
            return {"user_id": user_id, "transactions": [], "total": 0}
        
        # Get all transactions and filter by user_id in memo
        request = AccountTx(
            account=COMPANY_WALLET.address,
            ledger_index_min=-1
        )
        response = await client.request(request)
        
        user_txs = []
        for tx_data in response.result.get("transactions", []):
            tx = tx_data.get("tx", {})
            meta = tx_data.get("meta", {})
            
            # Parse memo
            memos = tx.get("Memos", [])
            if memos and len(memos) > 0:
                try:
                    memo_hex = memos[0].get("Memo", {}).get("MemoData", "")
                    if memo_hex:
                        memo_json = json.loads(binascii.unhexlify(memo_hex).decode())
                        
                        # Check if this transaction belongs to the user
                        if memo_json.get("user_id") == user_id:
                            user_txs.append({
                                "hash": tx.get("hash", ""),
                                "type": memo_json.get("type", "UNKNOWN"),
                                "ledger_index": tx.get("ledger_index", 0),
                                "timestamp": ripple_time_to_datetime(tx.get("date", 0)).isoformat() if tx.get("date") else None,
                                "validated": meta.get("TransactionResult") == "tesSUCCESS",
                                "data": memo_json,
                                "explorer_url": f"https://testnet.xrpl.org/transactions/{tx.get('hash', '')}"
                            })
                except:
                    pass
        
        # Get user wallet info if exists
        user_wallet_info = None
        if user_id in USER_WALLETS:
            wallet = USER_WALLETS[user_id]
            try:
                info = await client.request(AccountInfo(
                    account=wallet.address,
                    ledger_index="validated"
                ))
                user_wallet_info = {
                    "address": wallet.address,
                    "balance_xrp": float(drops_to_xrp(info.result["account_data"]["Balance"])),
                    "explorer_url": f"https://testnet.xrpl.org/accounts/{wallet.address}"
                }
            except:
                user_wallet_info = {
                    "address": wallet.address,
                    "balance_xrp": 0,
                    "explorer_url": f"https://testnet.xrpl.org/accounts/{wallet.address}"
                }
        
        return {
            "user_id": user_id,
            "wallet": user_wallet_info,
            "transactions": user_txs,
            "total": len(user_txs)
        }
        
    except Exception as e:
        print(f"❌ User Trail Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Legacy endpoint for backward compatibility
@app.post("/log")
async def legacy_log(user_id: int, amount: float, data: str):
    """Legacy logging endpoint."""
    return await log_purchase(PurchaseRequest(
        user_id=user_id,
        purchase_id=f"legacy-{int(time.time())}",
        item_name=data,
        item_icon="📦",
        purchase_amount=amount
    ))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)