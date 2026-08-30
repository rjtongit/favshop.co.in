# FavShop Admin Panel — Angular 19 + Angular Material 19.2.19

## Start

```powershell
npm install
npm start
```

Open:
http://localhost:4300

## Backend

FastAPI:
http://localhost:8000

Swagger:
http://localhost:8000/docs

API base:
http://localhost:8000/api

## Admin login

Use an existing seeded admin account from your FastAPI database.

The default values in the login form are:
admin@favshop.local
Admin@12345

Change them if your seeded admin credentials differ.

## Modules

- Admin authentication
- Admin route guard
- Dashboard
- Products
- Categories
- Orders
- Customers
- Coupons
- Reviews
- Angular Material UI
- Material Icons
- Responsive sidebar
- Responsive mobile layout
- REST API service layer

The service layer already contains methods for CRUD operations where the corresponding FastAPI endpoints exist. UI forms for some CRUD modules can be expanded once the exact backend request/response schemas are confirmed.
