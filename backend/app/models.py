from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__="users"
    id:Mapped[int]=mapped_column(primary_key=True)
    name:Mapped[str]=mapped_column(String(120))
    email:Mapped[str]=mapped_column(String(190),unique=True,index=True)
    mobile:Mapped[str|None]=mapped_column(String(20),nullable=True)
    password_hash:Mapped[str]=mapped_column(String(255))
    role:Mapped[str]=mapped_column(String(20),default="customer")
    status:Mapped[bool]=mapped_column(Boolean,default=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
    updated_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)

class Category(Base):
    __tablename__="categories"
    id:Mapped[int]=mapped_column(primary_key=True)
    name:Mapped[str]=mapped_column(String(150))
    slug:Mapped[str]=mapped_column(String(180),unique=True)
    description:Mapped[str|None]=mapped_column(Text,nullable=True)
    image:Mapped[str|None]=mapped_column(String(500),nullable=True)
    status:Mapped[bool]=mapped_column(Boolean,default=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
    updated_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)
    products=relationship("Product",back_populates="category")

class Product(Base):
    __tablename__="products"
    id:Mapped[int]=mapped_column(primary_key=True)
    category_id:Mapped[int]=mapped_column(ForeignKey("categories.id"))
    name:Mapped[str]=mapped_column(String(200))
    slug:Mapped[str]=mapped_column(String(220),unique=True)
    sku:Mapped[str]=mapped_column(String(80),unique=True)
    description:Mapped[str|None]=mapped_column(Text,nullable=True)
    price:Mapped[float]=mapped_column(Numeric(10,2))
    discount_price:Mapped[float|None]=mapped_column(Numeric(10,2),nullable=True)
    stock:Mapped[int]=mapped_column(Integer,default=0)
    featured:Mapped[bool]=mapped_column(Boolean,default=False)
    status:Mapped[bool]=mapped_column(Boolean,default=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
    updated_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)
    category=relationship("Category",back_populates="products")

class Cart(Base):
    __tablename__="carts"
    id:Mapped[int]=mapped_column(primary_key=True)
    user_id:Mapped[int]=mapped_column(ForeignKey("users.id"))
    product_id:Mapped[int]=mapped_column(ForeignKey("products.id"))
    quantity:Mapped[int]=mapped_column(Integer,default=1)

class Order(Base):
    __tablename__="orders"
    id:Mapped[int]=mapped_column(primary_key=True)
    user_id:Mapped[int]=mapped_column(ForeignKey("users.id"))
    order_number:Mapped[str]=mapped_column(String(60),unique=True)
    total:Mapped[float]=mapped_column(Numeric(10,2))
    payment_method:Mapped[str]=mapped_column(String(30))
    payment_status:Mapped[str]=mapped_column(String(30),default="pending")
    order_status:Mapped[str]=mapped_column(String(30),default="Pending")
    shipping_address:Mapped[str]=mapped_column(Text)
