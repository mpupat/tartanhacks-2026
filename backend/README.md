# 🛡️ PriceGuard XRPL Gateway API

This backend bridges the PriceGuard application logic with the **XRP Ledger (XRPL)**. It records purchases and hedges as immutable, verifiable audit logs on a decentralized ledger.

## 🚀 Base URL
- **Local:** `http://localhost:8000`
- **Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs) (Use this to test JSON payloads)

---

## 🛠️ API Reference

### 1. Log an Event
`POST /log`  
Use this to commit a new record to the blockchain.

**Request Body:**
| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | int | The unique internal ID for the user. |
| `amount` | float | Transaction value (USD). |
| `type` | string | `PURCHASE` or `HEDGE`. (Defaults to `PURCHASE`) |
| `data` | string | Description (e.g., "Amazon" or "XRP Price Hedge"). |

#### Example: Log a Purchase
```bash
curl -X 'POST' 'http://localhost:8000/log' \
-H 'Content-Type: application/json' \
-d '{
  "user_id": 101,
  "amount": 150.00,
  "type": "PURCHASE",
  "data": "Apple Store - AirPods"
}'

```

#### Example: Log a Bet (Hedge)

```bash
curl -X 'POST' 'http://localhost:8000/log' \
-H 'Content-Type: application/json' \
-d '{
  "user_id": 101,
  "amount": 5.00,
  "type": "HEDGE",
  "data": "XRP Price Protection < $1.40"
}'

```

---

### 2. Fetch History

`GET /history/{user_id}`

Retrieves the blockchain audit trail for a specific user.

**Query Parameters:**

* `tx_type` (Optional): Filter results by `PURCHASE` or `HEDGE`.

#### Example Call: Get ALL History

`GET http://localhost:8000/history/101`

#### Example Call: Get ONLY Purchases

`GET http://localhost:8000/history/101?tx_type=PURCHASE`

#### Example Call: Get ONLY Bets (Hedges)

`GET http://localhost:8000/history/101?tx_type=HEDGE`

**Response Shape:**

```json
{
  "user_id": 101,
  "total": 1,
  "history": [
    {
      "hash": "49A9223368EBF7550C326470E25155671CD77DF61CEDFEF64106E4C5367A05E1",
      "type": "HEDGE",
      "details": "XRP Price Protection < $1.40",
      "amount": 5.0,
      "timestamp": "2026-02-07 17:40"
    }
  ]
}

```

---

## 💡 Integration Notes for Frontend

* **Ledger Latency:** The XRPL takes **3–5 seconds** to validate. After a successful `POST /log`, wait a few seconds before calling `GET /history` to ensure the new record appears.
* **Verification:** Users can verify any transaction hash at:
`https://testnet.xrpl.org/transactions/{hash}`
* **CORS:** The backend is configured to allow cross-origin requests, so you can call this API directly from your React/Vue/Next.js frontend.
