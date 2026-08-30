import {Injectable,inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {API} from './api';

@Injectable({providedIn:'root'})
export class AdminAuthService{
 private http=inject(HttpClient);
 private userSubject=new BehaviorSubject<any>(this.readUser());
 user$=this.userSubject.asObservable();

 private readUser(){
  try{return JSON.parse(localStorage.getItem('favshop_admin_user')||'null')}catch{return null}
 }

 user(){return this.userSubject.value}

 login(payload:any){return this.http.post<any>(API+'/auth/login',payload)}

 save(response:any){
  localStorage.setItem('favshop_admin_token',response.data.access_token);
  localStorage.setItem('favshop_admin_user',JSON.stringify(response.data.user));
  this.userSubject.next(response.data.user);
 }

 logout(){
  localStorage.removeItem('favshop_admin_token');
  localStorage.removeItem('favshop_admin_user');
  this.userSubject.next(null);
 }
}

@Injectable({providedIn:'root'})
export class AdminApiService{
 private http=inject(HttpClient);

 dashboard(){return this.http.get<any>(API+'/admin/dashboard')}
 products(params:any={}){return this.http.get<any>(API+'/products',{params})}
 product(id:number){return this.http.get<any>(API+'/products/'+id)}
 createProduct(x:any){return this.http.post<any>(API+'/products',x)}
 updateProduct(id:number,x:any){return this.http.put<any>(API+'/products/'+id,x)}
 deleteProduct(id:number){return this.http.delete<any>(API+'/products/'+id)}

 categories(){return this.http.get<any>(API+'/categories')}
 createCategory(x:any){return this.http.post<any>(API+'/categories',x)}
 updateCategory(id:number,x:any){return this.http.put<any>(API+'/categories/'+id,x)}
 deleteCategory(id:number){return this.http.delete<any>(API+'/categories/'+id)}

 orders(){return this.http.get<any>(API+'/admin/orders')}
 updateOrder(id:number,x:any){return this.http.put<any>(API+'/admin/orders/'+id,x)}

 customers(){return this.http.get<any>(API+'/admin/customers')}
 updateCustomer(id:number,x:any){return this.http.put<any>(API+'/admin/customers/'+id,x)}

 coupons(){return this.http.get<any>(API+'/admin/coupons')}
 createCoupon(x:any){return this.http.post<any>(API+'/admin/coupons',x)}
 updateCoupon(id:number,x:any){return this.http.put<any>(API+'/admin/coupons/'+id,x)}
 deleteCoupon(id:number){return this.http.delete<any>(API+'/admin/coupons/'+id)}

 reviews(){return this.http.get<any>(API+'/admin/reviews')}
 updateReview(id:number,x:any){return this.http.put<any>(API+'/admin/reviews/'+id,x)}
 deleteReview(id:number){return this.http.delete<any>(API+'/admin/reviews/'+id)}
}