# FavShop + Shiprocket Checkout / Fastrr setup

This version preserves the previously working FastAPI project structure (`app/config.py`, `app/db.py`, `app/main.py`) and adds the SRC Custom Integration catalog APIs from the documentation supplied for this project.

## 1. Credentials

Keep these only in `backend/.env`:

```env
SHIPROCKET_CHECKOUT_API_KEY=YOUR_API_KEY
SHIPROCKET_CHECKOUT_API_SECRET=YOUR_API_SECRET
SHIPROCKET_CHECKOUT_BASE_URL=https://checkout-api.shiprocket.com
SHIPROCKET_CHECKOUT_TIMEOUT=20
```

The browser/Angular application must never receive the API secret.

## 2. Catalog APIs required by SRC Custom Integration

The exact response envelope supplied in the documentation is implemented:

```text
GET /api/fastrr/catalog/products?page=1&limit=100
GET /api/fastrr/catalog/collections?page=1&limit=100
GET /api/fastrr/catalog/products-by-collection?collection_id=1234&page=1&limit=100
```

Responses use:

```json
{"data":{"total":11,"products":[]}}
```

and:

```json
{"data":{"total":9,"collections":[]}}
```

Product objects contain the fields shown in the supplied documentation, including variants, price, compare_at_price, SKU, quantity, image, options, timestamps and handle.

### IDs

The supplied documentation requires unique Long-style numeric IDs for product and variant IDs. This backend uses stable deterministic IDs:

- Fastrr product ID = `product_id * 1,000,000 + 10`
- Fastrr variant ID = `product_id * 1,000,000 + 11`
- Fastrr collection ID = `category_id * 1,000,000 + 12`

The checkout endpoint accepts both the existing FavShop product ID and the generated Fastrr variant ID, then resolves the product from MySQL.

## 3. Local testing

Start:

```powershell
uvicorn app.main:app --reload
```

Open:

http://localhost:8000/docs

Test:

```text
GET http://localhost:8000/api/fastrr/catalog/products?page=1&limit=100
GET http://localhost:8000/api/fastrr/catalog/collections?page=1&limit=100
```

Copy a returned collection ID and test:

```text
GET http://localhost:8000/api/fastrr/catalog/products-by-collection?collection_id=COLLECTION_ID&page=1&limit=100
```

## 4. Fastrr Custom Endpoint

Fastrr cannot call localhost. Deploy the backend on a public HTTPS URL first, then enter the three public catalog endpoint URLs in the Fastrr Custom Endpoint configuration.

Example:

```text
https://api.example.com/api/fastrr/catalog/products
https://api.example.com/api/fastrr/catalog/collections
https://api.example.com/api/fastrr/catalog/products-by-collection
```

## 5. Checkout signing

Outbound checkout requests are signed using HMAC-SHA256 over the exact JSON bytes sent in the request. The raw digest is Base64 encoded for `X-Api-HMAC-SHA256`.

The code intentionally uses:

```python
digest = hmac.new(secret, body, hashlib.sha256).digest()
signature = base64.b64encode(digest).decode("utf-8")
```

and sends the same `body` using `content=body`.

## 6. Current database limitation

The existing database has one product record per item and no separate product variant table/image table. Therefore this version represents each product as one Fastrr variant and uses the configured default image URL.

Before production, add persistent product variant records and product image records if your catalog needs multiple variants and real product images.
