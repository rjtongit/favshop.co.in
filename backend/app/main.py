import base64
from datetime import datetime, timedelta
import hashlib
import hmac
import json
from decimal import Decimal
from typing import Any

import httpx
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from huggingface_hub import InferenceClient
from groq import Groq
from .rag import search_documents

from .config import settings
from .db import Base, engine, get_db
from .models import User, Category, Product

Base.metadata.create_all(engine)

app = FastAPI(title="FavShop API", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Register(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile: str | None = None


class Login(BaseModel):
    email: EmailStr
    password: str


class FastrrCheckoutItem(BaseModel):
    variant_id: str | int
    quantity: int = 1


class FastrrCheckoutStart(BaseModel):
    items: list[FastrrCheckoutItem]

class ChatRequest(BaseModel):
    chatUser: str
    askedQuestion: str

client = Groq(
    api_key=settings.groq_api_key
)


def token(u):
    return jwt.encode(
        {"sub": str(u.id), "role": u.role, "exp": datetime.utcnow() + timedelta(hours=2)},
        settings.jwt_secret,
        algorithm="HS256",
    )


def slug(s):
    import re
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


@app.get("/api/health")
def health():
    return {"status": True, "message": "FavShop API is running"}


# Chatbot API
@app.post("/api/gk-chat")
def chat(request: ChatRequest):
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": request.chatUser,
                "content": request.askedQuestion
            }
        ],
    )
    answer = response.choices[0].message.content
    return {
        "question": request.askedQuestion,
        "answer": answer
    }

@app.post("/api/chat")
def chat(request: ChatRequest):

    question = request.askedQuestion

    # 1. Classify question
    category = classify_question(question)

    # 2. Decide where to send it
    if category == "company":

        answer = answer_from_rag(question)

    elif category == "general":

        answer = answer_general(question)

    elif category == "current":

        answer = answer_current(question)

    else:

        answer = "I could not determine how to answer this question."

    return {
        "question": question,
        "category": category,
        "answer": answer
    }

# Clasify user question and route
def classify_question(question: str):

    router_prompt = f"""
Classify the following user question into exactly ONE category.

Categories:

company
- Questions about our organization, employees, company policies,
  employee portal, HR rules, internal procedures, etc.

current
- Questions requiring current or live information,
  such as current politicians, current weather, today's news,
  current prices, current events, etc.

general
- General knowledge questions that don't require company information
  or current/live information.

Return ONLY one word:
company
current
general

User question:
{question}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": router_prompt
            }
        ],
        temperature=1,
        max_completion_tokens=2048,
        reasoning_effort="medium",
    )

    category = response.choices[0].message.content.strip().lower()

    return category

def answer_from_rag(question: str):

    relevant_chunks = search_documents(question)

    context = "\n\n".join(
        f"Source: {chunk['source']}\n"
        f"Page: {chunk['page']}\n"
        f"Content: {chunk['text']}"
        for chunk in relevant_chunks
    )

    prompt = f"""
You are an organizational assistant.

Answer the question using ONLY the company
information provided below.

For each piece of information, the source
document and page number are provided.

Company information:

{context}

User question:

{question}

If the information is not available,
say that you don't have enough information.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
    )

    return response.choices[0].message.content

def answer_general(question: str):

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": question
            }
        ],
    )

    return response.choices[0].message.content

def answer_current(question: str):

    return "Current information requires a web search API."


@app.post("/api/auth/register")
def register(x: Register, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=x.email).first():
        raise HTTPException(409, "Email already registered")
    u = User(name=x.name, email=x.email, mobile=x.mobile, password_hash=pwd.hash(x.password))
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"status": True, "data": {"id": u.id}}


@app.post("/api/auth/login")
def login(x: Login, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email=x.email).first()
    if not u or not pwd.verify(x.password, u.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {
        "status": True,
        "data": {
            "access_token": token(u),
            "token_type": "bearer",
            "user": {"id": u.id, "name": u.name, "email": u.email, "role": u.role},
        },
    }


@app.get("/api/categories")
def categories(db: Session = Depends(get_db)):
    return {
        "status": True,
        "data": [{"id": c.id, "name": c.name, "slug": c.slug} for c in db.query(Category).filter_by(status=True).all()],
    }


@app.get("/api/products")
def products(q: str | None = None, category_id: int | None = None, page: int = 1, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(Product).filter_by(status=True)
    if q:
        query = query.filter(Product.name.like(f"%{q}%"))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    total = query.count()
    rows = query.offset((page - 1) * limit).limit(min(limit, 100)).all()
    return {
        "status": True,
        "data": [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "sku": p.sku,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "stock": p.stock,
            }
            for p in rows
        ],
        "pagination": {"page": page, "limit": limit, "total": total},
    }


@app.get("/api/products/{product_id}")
def product(product_id: int, db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(404, "Product not found")
    return {
        "status": True,
        "data": {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "sku": p.sku,
            "description": p.description,
            "price": float(p.price),
            "discount_price": float(p.discount_price) if p.discount_price else None,
            "stock": p.stock,
        },
    }


@app.get("/api/admin/dashboard")
def admin_dashboard(db: Session = Depends(get_db)):
    return {
        "status": True,
        "data": {
            "products": db.query(Product).count(),
            "customers": db.query(User).filter_by(role="customer").count(),
            "categories": db.query(Category).count(),
        },
    }


# ---------------------------------------------------------------------------
# Fastrr / Shiprocket Smart One-Click Checkout
# ---------------------------------------------------------------------------
def _fastrr_headers(body: bytes) -> dict[str, str]:
    if (
        not settings.shiprocket_checkout_api_key
        or not settings.shiprocket_checkout_api_secret
    ):
        raise HTTPException(
            status_code=503,
            detail=(
                "Fastrr checkout is not configured. "
                "Add SHIPROCKET_CHECKOUT_API_KEY and "
                "SHIPROCKET_CHECKOUT_API_SECRET to backend/.env."
            ),
        )

    # IMPORTANT:
    # Fastrr expects Base64 encoded HMAC-SHA256,
    # NOT hexadecimal (.hexdigest()).
    digest = hmac.new(
        settings.shiprocket_checkout_api_secret.encode("utf-8"),
        body,
        hashlib.sha256,
    ).digest()

    signature = base64.b64encode(digest).decode("utf-8")

    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Api-Key": settings.shiprocket_checkout_api_key,
        "X-Api-HMAC-SHA256": signature,
    }

def _fastrr_post(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    body = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    headers = _fastrr_headers(body)
    url = settings.shiprocket_checkout_base_url.rstrip("/") + path
    try:
        with httpx.Client(timeout=settings.shiprocket_checkout_timeout) as client:
            response = client.post(url, content=body, headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Unable to connect to Fastrr Checkout: {exc}") from exc

    try:
        data = response.json()
    except ValueError:
        data = {"message": response.text}

    if response.is_error:
        message = data.get("error", {}).get("message") if isinstance(data.get("error"), dict) else None
        raise HTTPException(status_code=response.status_code, detail=message or data.get("message") or "Fastrr Checkout API error: ")
    return data
    # if response.is_error:
    #     print("========== FASTRR ERROR ==========")
    #     print("Status:", response.status_code)
    #     print("Response:", response.text)
    #     print("Parsed data:", data)
    #     print("===================================")

    #     raise HTTPException(
    #         status_code=response.status_code,
    #         detail={
    #             "message": "Fastrr Checkout API error",
    #             "fastrr_status": response.status_code,
    #             "fastrr_response": data
    #         }
    #     )

    # return data


def _product_catalog_data(p: Product) -> dict[str, Any]:
    price = float(p.discount_price if p.discount_price is not None else p.price)
    return {
        "price": price,
        "name": p.name,
        "image_url": settings.fastrr_default_product_image_url,
    }


@app.post("/api/fastrr/checkout/start")
def fastrr_checkout_start(payload: FastrrCheckoutStart, db: Session = Depends(get_db)):
    """Create a Fastrr checkout session. Secrets stay server-side."""
    if not payload.items:
        raise HTTPException(400, "At least one item is required")

    items: list[dict[str, Any]] = []
    for item in payload.items:
        quantity = max(1, int(item.quantity))
        try:
            product_id = int(item.variant_id)
        except (TypeError, ValueError):
            raise HTTPException(400, f"Invalid variant_id: {item.variant_id}")

        p = db.get(Product, product_id)
        if not p or not p.status:
            raise HTTPException(404, f"Product {product_id} not found")
        if p.stock < quantity:
            raise HTTPException(409, f"Only {p.stock} unit(s) available for {p.name}")

        # The custom/ad-hoc Fastrr flow is used here so the checkout price is
        # resolved from our server-side database and cannot be changed in the browser.
        items.append(
            {
                "variant_id": str(p.id),
                "quantity": quantity,
                "catalog_data": _product_catalog_data(p),
            }
        )

    checkout_payload = {
        "cart_data": {
            "items": items,
            "custom_attributes": {
                "source": "favshop-angular",
            },
        },
        "redirect_url": settings.fastrr_redirect_url,
        "timestamp": datetime.utcnow().isoformat(timespec="milliseconds") + "Z",
    }
    return _fastrr_post("/api/v1/access-token/checkout", checkout_payload)



# ---------------------------------------------------------------------------
# Fastrr / Shiprocket Custom Website Catalog APIs
# ---------------------------------------------------------------------------
# IMPORTANT:
# These three endpoints follow the response structures supplied in the
# SRC Custom Integration documentation:
#   GET /api/fastrr/catalog/products?page=1&limit=100
#   GET /api/fastrr/catalog/collections?page=1&limit=100
#   GET /api/fastrr/catalog/products-by-collection?collection_id=...&page=1&limit=100
#
# They intentionally do NOT require X-Api-Key unless the Fastrr documentation
# for your account explicitly requires inbound authentication. The supplied
# catalog examples only specify GET URLs and query parameters.

def _public_image_url(path: str | None) -> str:
    if not path:
        return settings.fastrr_default_product_image_url
    if path.startswith("http://") or path.startswith("https://"):
        return path
    # For a future public upload endpoint. Do not expose local filesystem paths.
    return settings.public_api_url.rstrip("/") + "/uploads/" + path.lstrip("/")


def _fastrr_product_id(product_id: int) -> int:
    # Stable, unique Long-style numeric ID for Fastrr.
    return int(product_id) * 1_000_000 + 10


def _fastrr_variant_id(product_id: int) -> int:
    return int(product_id) * 1_000_000 + 11


def _fastrr_collection_id(category_id: int) -> int:
    return int(category_id) * 1_000_000 + 12


def _product_id_from_fastrr_variant_id(variant_id: int) -> int | None:
    value = int(variant_id)
    if value >= 1_000_000:
        return (value - 11) // 1_000_000
    # Backward compatibility with the existing Angular app, which sends
    # FavShop product IDs directly.
    return value


def _category_id_from_fastrr_collection_id(collection_id: int) -> int | None:
    value = int(collection_id)
    if value >= 1_000_000:
        return (value - 12) // 1_000_000
    # Backward compatibility for local testing.
    return value


def _product_image_url(p: Product) -> str:
    # Current schema has no product_images table. Use configured fallback.
    # When an image column/table is added, this helper is the only place
    # that needs changing.
    return settings.fastrr_default_product_image_url


def _fastrr_product(p: Product) -> dict[str, Any]:
    current_price = Decimal(
        p.discount_price if p.discount_price is not None else p.price
    )
    compare_at = (
        Decimal(p.price) if p.discount_price is not None else None
    )
    image_url = _product_image_url(p)

    return {
        "id": _fastrr_product_id(p.id),
        "title": p.name,
        "body_html": f"<p>{p.description or ''}</p>",
        "vendor": "FavShop",
        "product_type": p.category.name if p.category else "Devotional Products",
        "created_at": p.created_at.isoformat(),
        "handle": p.slug,
        "updated_at": p.updated_at.isoformat(),
        "tags": "",
        "status": "active" if p.status else "inactive",
        "variants": [
            {
                "id": _fastrr_variant_id(p.id),
                "title": p.name,
                "price": f"{current_price:.2f}",
                "compare_at_price": f"{compare_at:.2f}" if compare_at is not None else None,
                "sku": p.sku,
                "created_at": p.created_at.isoformat(),
                "updated_at": p.updated_at.isoformat(),
                "taxable": True,
                "quantity": int(p.stock),
                "grams": 0,
                "image": {"src": image_url},
                "option_values": {},
                "weight": 0,
                "weight_unit": "g",
            }
        ],
        "options": [],
        "image": {"src": image_url},
    }


@app.get("/api/fastrr/catalog/products")
def fastrr_catalog_products(
    page: int = 1,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    page = max(1, page)
    limit = min(max(1, limit), 100)
    query = db.query(Product).filter(Product.status.is_(True)).order_by(Product.id.asc())
    total = query.count()
    rows = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "data": {
            "total": total,
            "products": [_fastrr_product(p) for p in rows],
        }
    }


@app.get("/api/fastrr/catalog/collections")
def fastrr_catalog_collections(
    page: int = 1,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    page = max(1, page)
    limit = min(max(1, limit), 100)
    query = db.query(Category).filter(Category.status.is_(True)).order_by(Category.id.asc())
    total = query.count()
    rows = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "data": {
            "total": total,
            "collections": [
                {
                    "id": _fastrr_collection_id(c.id),
                    "updated_at": c.updated_at.isoformat(),
                    "body_html": f"<p>{c.description or ''}</p>",
                    "handle": c.slug,
                    "image": {"src": _public_image_url(c.image)},
                    "title": c.name,
                    "created_at": c.created_at.isoformat(),
                }
                for c in rows
            ],
        }
    }


@app.get("/api/fastrr/catalog/products-by-collection")
def fastrr_catalog_products_by_collection(
    collection_id: int,
    page: int = 1,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    page = max(1, page)
    limit = min(max(1, limit), 100)
    category_id = _category_id_from_fastrr_collection_id(collection_id)

    category = db.get(Category, category_id) if category_id else None
    if not category or not category.status:
        raise HTTPException(404, "Collection not found")

    query = (
        db.query(Product)
        .filter(
            Product.category_id == category_id,
            Product.status.is_(True),
        )
        .order_by(Product.id.asc())
    )
    total = query.count()
    rows = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "data": {
            "total": total,
            "products": [_fastrr_product(p) for p in rows],
        }
    }


# ---------------------------------------------------------------------------
# Fastrr checkout
# ---------------------------------------------------------------------------

def _product_catalog_data(p: Product) -> dict[str, Any]:
    price = float(
        p.discount_price if p.discount_price is not None else p.price
    )
    return {
        "price": price,
        "name": p.name,
        "image_url": _product_image_url(p),
    }


@app.post("/api/fastrr/checkout/start")
def fastrr_checkout_start(
    payload: FastrrCheckoutStart,
    db: Session = Depends(get_db),
):
    if not payload.items:
        raise HTTPException(400, "At least one item is required")

    items: list[dict[str, Any]] = []

    for item in payload.items:
        quantity = max(1, int(item.quantity))

        try:
            product_id = _product_id_from_fastrr_variant_id(item.variant_id)
        except (TypeError, ValueError):
            raise HTTPException(
                400, f"Invalid variant_id: {item.variant_id}"
            )

        p = db.get(Product, product_id)
        if not p or not p.status:
            raise HTTPException(404, f"Product {product_id} not found")
        if p.stock < quantity:
            raise HTTPException(
                409,
                f"Only {p.stock} unit(s) available for {p.name}",
            )

        items.append(
            {
                "variant_id": str(_fastrr_variant_id(p.id)),
                "quantity": quantity,
                "catalog_data": _product_catalog_data(p),
            }
        )

    checkout_payload = {
        "cart_data": {
            "items": items,
            "custom_attributes": {
                "source": "favshop-angular",
            },
        },
        "redirect_url": settings.fastrr_redirect_url,
    }

    return _fastrr_post(
        "/api/v1/access-token/checkout",
        checkout_payload,
    )

@app.get("/docs-info")
def docs_info():
    return {"swagger": "/docs", "redoc": "/redoc"}
