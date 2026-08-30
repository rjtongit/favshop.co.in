from app.db import Base,engine,SessionLocal
from app.models import User,Category,Product
from passlib.context import CryptContext
import re
Base.metadata.create_all(engine)
db=SessionLocal(); pwd=CryptContext(schemes=["bcrypt"],deprecated="auto")
if not db.query(User).filter_by(email="admin@favshop.local").first():
    db.add(User(name="FavShop Admin",email="admin@favshop.local",password_hash=pwd.hash("Admin@12345"),role="admin"))
names=["Laddu Gopal Dresses","Krishna Items","Radha Krishna Items","Ganesh Ji Items","Puja Items","Rudraksha Mala","Devotional Jewellery","Temple Accessories","Decorative Items"]
for n in names:
    if not db.query(Category).filter_by(name=n).first(): db.add(Category(name=n,slug=re.sub(r"[^a-z0-9]+","-",n.lower()).strip("-")))
db.commit(); cats=db.query(Category).all()
for i in range(20):
    n=f"Sample Devotional Product {i+1}"
    if not db.query(Product).filter_by(sku=f"FS{i+1:04}").first():
        db.add(Product(category_id=cats[i%len(cats)].id,name=n,slug=n.lower().replace(" ","-"),sku=f"FS{i+1:04}",description="FavShop devotional product",price=199+i*20,discount_price=179+i*18,stock=100,featured=i<5))
db.commit();db.close()
print("Seed complete. Admin: admin@favshop.local / Admin@12345")
