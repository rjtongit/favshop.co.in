import {Component,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {CartService} from '../../core/services';
import {FastrrService} from '../../core/fastrr.service';

@Component({standalone:true,imports:[CommonModule,RouterLink,MatButtonModule,MatIconModule,MatCardModule],template:`<div class="page narrow"><div class="page-title"><span class="eyebrow">YOUR BAG</span><h1>Shopping cart</h1></div><div *ngIf="!items.length" class="empty"><mat-icon>shopping_bag</mat-icon><h2>Your bag is empty</h2><a mat-flat-button class="primary-btn" routerLink="/products">Explore products</a></div><div class="cart-list" *ngIf="items.length"><mat-card *ngFor="let x of items" class="cart-row"><div class="cart-thumb">🪔</div><div class="cart-info"><b>{{x.product?.name||'Product'}}</b><span>Quantity: {{x.quantity}}</span></div><button mat-icon-button color="warn" (click)="remove(x.id)"><mat-icon>delete_outline</mat-icon></button></mat-card><div class="cart-summary"><span>Subtotal</span><b>Calculated at checkout</b><button mat-flat-button class="primary-btn" [disabled]="checkoutLoading" (click)="checkout($event)">{{checkoutLoading?'Opening checkout…':'Proceed to checkout'}}</button><p class="muted-copy" *ngIf="checkoutError">{{checkoutError}}</p></div></div></div>`})
export class CartComponent{
 items:any[]=[]; c=inject(CartService); f=inject(FastrrService);
 checkoutLoading=false; checkoutError='';
 constructor(){this.load()}
 load(){this.c.list().subscribe({next:r=>this.items=r.data||[],error:()=>this.items=[]})}
 remove(id:number){this.c.remove(id).subscribe(()=>this.load())}
 checkout(event:Event){
   if(this.checkoutLoading||!this.items.length)return;
   this.checkoutLoading=true;this.checkoutError='';
   const items=this.items.map(x=>({variant_id:x.product?.id||x.product_id,quantity:x.quantity||1})).filter(x=>x.variant_id);
   this.f.startCheckout(items).subscribe({
     next:(r:any)=>{
       const checkoutToken=r?.result?.token||r?.token;
       if(!checkoutToken){this.checkoutLoading=false;this.checkoutError=r?.error?.message||r?.message||'Fastrr did not return a checkout token.';return;}
       try{this.f.launch(event,checkoutToken);this.checkoutLoading=false;}catch(e:any){this.checkoutLoading=false;this.checkoutError=e?.message||'Unable to open Fastrr Checkout.';}
     },
     error:(err:any)=>{this.checkoutLoading=false;this.checkoutError=err?.error?.detail||err?.error?.message||'Unable to open checkout. Please try again.';}
   });
 }
}
