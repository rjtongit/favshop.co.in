import {Component,inject} from '@angular/core';
import {CommonModule} from'@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink}from '@angular/router'; 
import {MatButtonModule} from'@angular/material/button';
import {MatCardModule} from'@angular/material/card';
import {MatIconModule} from'@angular/material/icon';
import {MatFormFieldModule} from'@angular/material/form-field';
import {MatInputModule} from'@angular/material/input';
import {MatSelectModule} from'@angular/material/select';
import {MatProgressSpinnerModule} from'@angular/material/progress-spinner'; 
import {ProductService,CategoryService}from '../../core/services';
@Component({standalone:true,imports:[CommonModule,FormsModule,RouterLink,MatButtonModule,MatCardModule,MatIconModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule],
template:`
<div class="page">
  <div class="page-title">
    <span class="eyebrow">THE COLLECTION</span>
    <h1>Devotional products</h1>
    <p>Find something meaningful for your temple, home or loved ones.</p>
  </div>
  <div class="toolbar">
    <mat-form-field appearance="outline" class="search"
      ><mat-label>Search products</mat-label
      ><input matInput [(ngModel)]="q" (keyup.enter)="load()" /><mat-icon
        matPrefix
        >search</mat-icon
      ></mat-form-field
    ><mat-form-field appearance="outline"
      ><mat-label>Sort by</mat-label
      ><mat-select [(ngModel)]="sort"
        ><mat-option value="featured">Featured</mat-option
        ><mat-option value="price-low">Price: low to high</mat-option
        ><mat-option value="price-high"
          >Price: high to low</mat-option
        ></mat-select
      ></mat-form-field
    ><button mat-stroked-button (click)="load()">
      <mat-icon>tune</mat-icon> Apply
    </button>
  </div>
  <div *ngIf="loading" class="loading">
    <mat-spinner diameter="36"></mat-spinner>
  </div>
  <div class="product-grid" *ngIf="!loading">
    <mat-card class="product-card" *ngFor="let p of products"
      ><a [routerLink]="['/products',p.id]"
        ><div class="product-image">🪔</div></a
      ><mat-card-content
        ><small>DEVOTIONAL</small>
        <h3>{{p.name}}</h3>
        <p class="stock" [class.out]="!p.stock">
          {{p.stock?'In stock':'Out of stock'}}
        </p>
        <div class="price">₹{{p.discount_price||p.price}}</div>
        <a mat-flat-button class="add-btn" [routerLink]="['/products',p.id]"
          >View product</a
        ></mat-card-content
      ></mat-card
    >
  </div>
</div>
` })
export class
ProductsComponent{
    products:any[]=[];
    q='';sort='featured';
    loading=false;
    p=inject(ProductService);
    constructor(){
        this.load()
    }
    load(){
        this.loading=true;
        this.p.list({
            q:this.q,limit:50}).subscribe({next:r=>{
                this.products=r.data;this.loading=false
            },error:()=>this.loading=false
            })
        }}
