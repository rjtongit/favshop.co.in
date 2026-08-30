import {Injectable,inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {API} from './api';

@Injectable({providedIn:'root'})
export class AuthService{
 private http=inject(HttpClient); private userSubject=new BehaviorSubject<any>(this.read());
 user$=this.userSubject.asObservable();
 private read(){try{return JSON.parse(localStorage.getItem('favshop_user')||'null')}catch{return null}}
 user(){return this.userSubject.value}
 login(x:any){return this.http.post<any>(API+'/auth/login',x)}
 register(x:any){return this.http.post(API+'/auth/register',x)}
 save(r:any){localStorage.setItem('favshop_token',r.data.access_token);localStorage.setItem('favshop_user',JSON.stringify(r.data.user));this.userSubject.next(r.data.user)}
 logout(){localStorage.removeItem('favshop_token');localStorage.removeItem('favshop_user');this.userSubject.next(null)}
}
@Injectable({providedIn:'root'}) export class ProductService{
 private http=inject(HttpClient);
 list(params:any={}){return this.http.get<any>(API+'/products',{params})}
 get(id:number){return this.http.get<any>(API+'/products/'+id)}
}
@Injectable({providedIn:'root'}) export class CategoryService{private http=inject(HttpClient);list(){return this.http.get<any>(API+'/categories')}}
@Injectable({providedIn:'root'}) export class CartService{
 private http=inject(HttpClient); count$=new BehaviorSubject(0);
 list(){return this.http.get<any>(API+'/cart')}
 add(product_id:number,quantity=1){return this.http.post<any>(API+'/cart',{product_id,quantity})}
 remove(id:number){return this.http.delete<any>(API+'/cart/'+id)}
}
@Injectable({providedIn:'root'}) export class OrderService{
 private http=inject(HttpClient); list(){return this.http.get<any>(API+'/orders')}
 create(x:any){return this.http.post<any>(API+'/orders',x)}
}