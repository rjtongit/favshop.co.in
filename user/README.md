# FavShop User Panel — Angular 19 + Angular Material

Modern minimalistic customer storefront.

## Run

Open PowerShell in this folder:

```powershell
npm install
npm start
```

Open:
http://localhost:4200

## Backend

FastAPI must be running:

```powershell
uvicorn app.main:app --reload
```

API:
http://localhost:8000/api

Swagger:
http://localhost:8000/docs

## Implemented UI foundation

- Angular 19 standalone architecture
- Angular Material 19
- Responsive modern/minimal storefront
- Sticky navigation
- Home / hero / categories / featured products
- Product listing
- Search
- Product details
- Login / registration
- Cart
- Checkout screen with COD/Razorpay selection
- Orders
- Customer account
- JWT HTTP interceptor
- Reusable services
- Mobile responsive layouts

The current FastAPI backend must expose the corresponding cart/order endpoints for those flows to operate end-to-end. Razorpay UI selection is included, but actual Razorpay order creation/verification/webhooks require the backend payment endpoints.
