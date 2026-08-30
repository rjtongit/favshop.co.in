import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ProductsComponent} from './pages/products/products.component';
import {ProductDetailsComponent} from './pages/product-details/product-details.component';
import {LoginComponent} from './pages/auth/login.component';
import {RegisterComponent} from './pages/auth/register.component';
import {CartComponent} from './pages/cart/cart.component';
import {CheckoutComponent} from './pages/checkout/checkout.component';
import {OrdersComponent} from './pages/orders/orders.component';
import {AccountComponent} from './pages/account/account.component';
export const routes:Routes=[
 {path:'',component:HomeComponent},
 {path:'products',component:ProductsComponent},
 {path:'products/:id',component:ProductDetailsComponent},
 {path:'login',component:LoginComponent},
 {path:'register',component:RegisterComponent},
 {path:'cart',component:CartComponent},
 {path:'checkout/success',component:CheckoutComponent},
 {path:'checkout',redirectTo:'checkout/success',pathMatch:'full'},
 {path:'orders',component:OrdersComponent},
 {path:'account',component:AccountComponent},
 {path:'**',redirectTo:''}
];
