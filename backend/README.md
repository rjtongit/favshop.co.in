# FavShop FastAPI Backend - Fastrr Updated

This package is an update of the previously working backend. The original project structure and dependencies are preserved.

## Start on Windows

From this `backend` folder, use the SAME virtual environment that was already working:

```powershell
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

If you already have a working venv, do not create a new one unless necessary.

Swagger:
http://localhost:8000/docs

Health:
http://localhost:8000/api/health

## MySQL

The existing `.env` is intentionally not included in the distributed ZIP. Keep your working `.env` and add/update:

```env
SHIPROCKET_CHECKOUT_API_KEY=
SHIPROCKET_CHECKOUT_API_SECRET=
SHIPROCKET_CHECKOUT_BASE_URL=https://checkout-api.shiprocket.com
SHIPROCKET_CHECKOUT_TIMEOUT=20
FASTRR_REDIRECT_URL=http://localhost:4200/checkout/success
FASTRR_DEFAULT_PRODUCT_IMAGE_URL=https://placehold.co/600x600/png?text=FavShop
PUBLIC_API_URL=http://localhost:8000
```

Do not expose the API secret to Angular.

## Fastrr Catalog

Implemented according to the supplied SRC Custom Integration examples:

```text
GET /api/fastrr/catalog/products?page=1&limit=100
GET /api/fastrr/catalog/collections?page=1&limit=100
GET /api/fastrr/catalog/products-by-collection?collection_id=1234&page=1&limit=100
```

The old endpoints remain available for compatibility.

## Checkout

```text
POST /api/fastrr/checkout/start
```

The backend validates the product and stock, builds the checkout request server-side and signs the exact request body.

## Important

This ZIP modifies the working backend rather than switching it to the new `app/core` structure from the earlier regenerated package.
