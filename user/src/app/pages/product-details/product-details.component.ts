import {Component,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {ProductService,CartService} from '../../core/services';
import {FastrrService} from '../../core/fastrr.service';

@Component({standalone:true,imports:[CommonModule,RouterLink,MatButtonModule,MatIconModule,MatCardModule,MatDividerModule],
template:`<div class="detail-page" *ngIf="p"><div class="detail-image">🪔</div><div class="detail-copy"><a mat-button routerLink="/products"><mat-icon>arrow_back</mat-icon> Back to collection</a><span class="eyebrow">DEVOTIONAL COLLECTION</span><h1>{{p.name}}</h1><div class="detail-price">₹{{p.discount_price||p.price}}</div><p class="muted-copy">{{p.description||'A thoughtfully selected devotional product for your sacred space.'}}</p><mat-divider></mat-divider><div class="availability"><mat-icon>check_circle</mat-icon>{{p.stock?'In stock and ready to ship':'Currently unavailable'}}</div><div class="detail-actions"><button mat-flat-button class="primary-btn" [disabled]="!p.stock" (click)="add()"><mat-icon>shopping_bag</mat-icon> Add to bag</button><button mat-stroked-button [disabled]="!p.stock||checkoutLoading" (click)="buyNow($event)">{{checkoutLoading?'Opening checkout…':'Buy now'}}</button></div><small>Fast one-page checkout • COD and online payment available</small><p class="muted-copy" *ngIf="checkoutError">{{checkoutError}}</p></div></div>`
})
export class ProductDetailsComponent{
 p:any; id=+inject(ActivatedRoute).snapshot.params['id'];
 s=inject(ProductService); c=inject(CartService); f=inject(FastrrService);
 checkoutLoading=false; checkoutError='';
 constructor(){this.s.get(this.id).subscribe(r=>this.p=r.data)}
 add(){this.c.add(this.id).subscribe(()=>alert('Added to bag'))}
 buyNow(event:Event){
   event.preventDefault();
   if(!this.p?.stock || this.checkoutLoading) return;
   this.checkoutLoading=true; this.checkoutError='';
   this.f.startCheckout([{variant_id:this.p.id,quantity:1}]).subscribe({
     next:(r:any)=>{
       const checkoutToken=r?.result?.token || r?.token;
       if(!checkoutToken){this.checkoutLoading=false;this.checkoutError=r?.error?.message||r?.message||'Fastrr did not return a checkout token.';return;}
       try{this.f.launch(event,checkoutToken);this.checkoutLoading=false;}catch(e:any){this.checkoutLoading=false;this.checkoutError=e?.message||'Unable to open Fastrr Checkout.';}
     },
     error:(err:any)=>{
       this.checkoutLoading=false;
       this.checkoutError=err?.error?.detail || err?.error?.message || 'Unable to open checkout. Please try again.';
     }
   });
 }
}
