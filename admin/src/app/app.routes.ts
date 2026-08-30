import {Routes} from '@angular/router';
import {adminGuard} from './core/auth.guard';
import {AdminLoginComponent} from './pages/login/admin-login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {ProductsComponent} from './pages/products/products.component';
import {CategoriesComponent} from './pages/categories/categories.component';
import {OrdersComponent} from './pages/orders/orders.component';
import {CustomersComponent} from './pages/customers/customers.component';
import {CouponsComponent} from './pages/coupons/coupons.component';
import {ReviewsComponent} from './pages/reviews/reviews.component';

export const routes:Routes=[
 {path:'login',component:AdminLoginComponent},
 {path:'',canActivate:[adminGuard],component:DashboardComponent},
 {path:'products',canActivate:[adminGuard],component:ProductsComponent},
 {path:'categories',canActivate:[adminGuard],component:CategoriesComponent},
 {path:'orders',canActivate:[adminGuard],component:OrdersComponent},
 {path:'customers',canActivate:[adminGuard],component:CustomersComponent},
 {path:'coupons',canActivate:[adminGuard],component:CouponsComponent},
 {path:'reviews',canActivate:[adminGuard],component:ReviewsComponent},
 {path:'**',redirectTo:''}
];