import binascii
import json
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional # Added for the filter

# --- XRPL ASYNC IMPORTS ---
from xrpl.asyncio.clients import AsyncJsonRpcClient
from xrpl.asyncio.wallet import generate_faucet_wallet
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.models.transactions import AccountSet, Memo
from xrpl.models.requests import AccountTx
from xrpl.utils import str_to_hex, ripple_time_to_datetime

app = FastAPI()

# --- CONFIGURATION ---
XRPL_URL = "https://s.altnet.rippletest.net:51234"
client = AsyncJsonRpcClient(XRPL_URL)
COMPANY_WALLET = None

async def get_wallet():
    global COMPANY_WALLET
    if COMPANY_WALLET is None:
        print("Funding company wallet on Testnet... (this takes ~10s)")
        COMPANY_WALLET = await generate_faucet_wallet(client)
        print(f"Master Wallet Active: {COMPANY_WALLET.address}")
    return COMPANY_WALLET

# --- API DATA MODELS ---
class TransactionRequest(BaseModel):
    user_id: int
    amount: float
    data: str  
    type: str = "PURCHASE" # Default to purchase, friend can send "HEDGE"

# --- HELPERS ---
def hex_to_str(hex_val):
    return binascii.unhexlify(hex_val).decode('utf-8')

# --- ROUTES ---

@app.get("/")
async def root():
    return {"status": "online", "message": "PriceGuard XRPL API is running."}

@app.post("/log")
async def log_to_ledger(req: TransactionRequest):
    try:
        wallet = await get_wallet()
        payload = {
            "u": req.user_id,
            "a": req.amount,
            "d": req.data,
            "t": req.type.upper() # New: Tagging the transaction type
        }

        memo = Memo(
            memo_data=str_to_hex(json.dumps(payload)),
            memo_type=str_to_hex("PriceGuard_Audit"),
            memo_format=str_to_hex("json")
        )

        tx = AccountSet(account=wallet.address, memos=[memo])
        response = await submit_and_wait(tx, client, wallet)
        
        return {"status": "success", "xrpl_hash": response.result.get("hash")}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_history(user_id: int, tx_type: Optional[str] = None): # Added Optional filter
    try:
        wallet = await get_wallet()
        request = AccountTx(account=wallet.address, ledger_index_min=-1)
        response = await client.request(request)
        
        transactions = response.result.get("transactions", [])
        user_history = []

        for item in transactions:
            tx_data = item.get("tx_json") if "tx_json" in item else item
            
            if "Memos" in tx_data:
                for m in tx_data["Memos"]:
                    try:
                        memo_content = m.get("Memo", m)
                        memo_hex = memo_content.get("MemoData")
                        if not memo_hex: continue

                        memo_json = json.loads(hex_to_str(memo_hex))
                        
                        # Filter by User ID
                        if str(memo_json.get("u")) == str(user_id):
                            # New: Optional filter by Type (PURCHASE/HEDGE)
                            current_type = memo_json.get("t", "PURCHASE")
                            if tx_type and current_type != tx_type.upper():
                                continue

                            tx_hash = item.get("hash") or tx_data.get("hash")
                            raw_date = tx_data.get("date")
                            clean_date = ripple_time_to_datetime(raw_date).strftime("%Y-%m-%d %H:%M") if raw_date else "Unknown"

                            user_history.append({
                                "hash": tx_hash,
                                "type": current_type,
                                "details": memo_json.get("d"),
                                "amount": memo_json.get("a"),
                                "timestamp": clean_date
                            })
                    except:
                        continue
        
        return {"user_id": user_id, "total": len(user_history), "history": user_history}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)