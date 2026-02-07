import binascii
import json
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# --- XRPL ASYNC IMPORTS ---
from xrpl.asyncio.clients import AsyncJsonRpcClient
from xrpl.asyncio.wallet import generate_faucet_wallet
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.models.transactions import AccountSet, Memo
from xrpl.models.requests import AccountTx
from xrpl.utils import str_to_hex, ripple_time_to_datetime

app = FastAPI()

# --- CONFIGURATION ---
# Connect to a public XRPL Testnet node
XRPL_URL = "https://s.altnet.rippletest.net:51234"
client = AsyncJsonRpcClient(XRPL_URL)

# This will store our Company Wallet once it's funded by the faucet
COMPANY_WALLET = None

async def get_wallet():
    """Lazily initializes/funds the master company wallet."""
    global COMPANY_WALLET
    if COMPANY_WALLET is None:
        print("Funding company wallet on Testnet... (this takes ~10s)")
        # This auto-generates a wallet and asks the faucet for 1,000 test XRP
        COMPANY_WALLET = await generate_faucet_wallet(client)
        print(f"Master Wallet Active: {COMPANY_WALLET.address}")
    return COMPANY_WALLET

# --- API DATA MODELS ---
class TransactionRequest(BaseModel):
    user_id: int
    amount: float
    data: str  # e.g., "Amazon Purchase" or "Bet: UP"

# --- HELPERS ---
def hex_to_str(hex_val):
    """Converts XRPL Hex strings back to UTF-8 text."""
    return binascii.unhexlify(hex_val).decode('utf-8')

# --- ROUTES ---

@app.get("/")
async def root():
    return {"status": "online", "message": "PriceGuard XRPL API is running."}

@app.post("/log")
async def log_to_ledger(req: TransactionRequest):
    """
    Logs a purchase or bet to the blockchain using an AccountSet transaction.
    This creates an immutable audit trail on the company account.
    """
    try:
        wallet = await get_wallet()
        
        # We pack our data into a small JSON object
        payload = {
            "u": req.user_id,
            "a": req.amount,
            "d": req.data
        }

        # Convert the JSON to Hex for the Ledger Memo
        memo = Memo(
            memo_data=str_to_hex(json.dumps(payload)),
            memo_type=str_to_hex("PriceGuard_Audit"),
            memo_format=str_to_hex("json")
        )

        # AccountSet is used for account state changes—perfect for logging to self.
        tx = AccountSet(
            account=wallet.address,
            memos=[memo]
        )

        # Sign and submit the transaction
        response = await submit_and_wait(tx, client, wallet)
        
        return {
            "status": "success", 
            "xrpl_hash": response.result.get("hash")
        }

    except Exception as e:
        print(f"LOG ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_history(user_id: int):
    try:
        wallet = await get_wallet()
        print(f"\n[DEBUG] Querying history for Address: {wallet.address}")
        
        request = AccountTx(
            account=wallet.address,
            ledger_index_min=-1
        )
        response = await client.request(request)
        
        transactions = response.result.get("transactions", [])
        print(f"[DEBUG] Total transactions found on Ledger: {len(transactions)}")

        if len(transactions) > 0:
            # Print the keys of the first transaction to see the 'shape'
            print(f"[DEBUG] First transaction keys: {transactions[0].keys()}")

        user_history = []
        for item in transactions:
            # THE FIX: The debug log shows your node uses 'tx_json'
            tx_data = item.get("tx_json") if "tx_json" in item else item
            
            # Additional safety: check if Memos exists in this specific structure
            if "Memos" in tx_data:
                for m in tx_data["Memos"]:
                    try:
                        # Some nodes wrap it as m["Memo"]["MemoData"], others just m["MemoData"]
                        memo_content = m.get("Memo", m)
                        memo_hex = memo_content.get("MemoData")
                        
                        if not memo_hex:
                            continue

                        memo_str = binascii.unhexlify(memo_hex).decode('utf-8')
                        print(f"[DEBUG] Found Memo String: {memo_str}")
                        
                        memo_json = json.loads(memo_str)
                        
                        # Compare IDs
                        if str(memo_json.get("u")) == str(user_id):
                            # Ensure we get a hash even if the key name varies
                            tx_hash = item.get("hash") or tx_data.get("hash") or tx_data.get("transaction_hash")
                            
                            # Convert Ripple Epoch to Human Date
                            raw_date = tx_data.get("date")
                            clean_date = "Unknown"
                            if raw_date:
                                clean_date = ripple_time_to_datetime(raw_date).strftime("%Y-%m-%d %H:%M")

                            user_history.append({
                                "hash": tx_hash,
                                "details": memo_json.get("d"),
                                "amount": memo_json.get("a"),
                                "timestamp": clean_date
                            })

                    except Exception as e:
                        print(f"[DEBUG] Parsing error: {e}")
                        continue
        
        return {"user_id": user_id, "total": len(user_history), "history": user_history}

    except Exception as e:
        print(f"[ERROR] History endpoint crashed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        print(f"HISTORY ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"History Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)