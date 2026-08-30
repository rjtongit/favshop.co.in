import {Component,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink,RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AdminAuthService} from './core/services';

@Component({
 selector:'app-root',
 standalone:true,
 imports:[
  CommonModule,RouterLink,RouterOutlet,MatToolbarModule,MatSidenavModule,
  MatListModule,MatIconModule,MatButtonModule,MatTooltipModule
 ],
 template:`
 <ng-container *ngIf="auth.user();else loginLayout">
  <mat-sidenav-container class="admin-shell">
   <mat-sidenav #drawer mode="side" opened class="sidebar">
    <div class="logo"><span>ॐ</span><div><b>FavShop</b><small>ADMIN</small></div></div>
    <div class="menu-label">MAIN MENU</div>
    <mat-nav-list>
      <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>Dashboard</span></a>
      <a mat-list-item routerLink="/products" routerLinkActive="active"><mat-icon matListItemIcon>inventory_2</mat-icon><span matListItemTitle>Products</span></a>
      <a mat-list-item routerLink="/categories" routerLinkActive="active"><mat-icon matListItemIcon>category</mat-icon><span matListItemTitle>Categories</span></a>
      <a mat-list-item routerLink="/orders" routerLinkActive="active"><mat-icon matListItemIcon>shopping_bag</mat-icon><span matListItemTitle>Orders</span></a>
      <a mat-list-item routerLink="/customers" routerLinkActive="active"><mat-icon matListItemIcon>people</mat-icon><span matListItemTitle>Customers</span></a>
      <div class="menu-label second">MARKETING</div>
      <a mat-list-item routerLink="/coupons" routerLinkActive="active"><mat-icon matListItemIcon>local_offer</mat-icon><span matListItemTitle>Coupons</span></a>
      <a mat-list-item routerLink="/reviews" routerLinkActive="active"><mat-icon matListItemIcon>star</mat-icon><span matListItemTitle>Reviews</span></a>
    </mat-nav-list>
    <div class="sidebar-bottom"><button mat-button (click)="auth.logout()"><mat-icon>logout</mat-icon> Sign out</button></div>
   </mat-sidenav>
   <mat-sidenav-content>
    <mat-toolbar class="topbar">
      <button mat-icon-button class="mobile-menu" (click)="drawer.toggle()"><mat-icon>menu</mat-icon></button>
      <span class="toolbar-title">Admin Console</span><span class="spacer"></span>
      <a mat-icon-button routerLink="/" matTooltip="Dashboard"><mat-icon>home</mat-icon></a>
      <div class="admin-user"><div class="avatar">{{auth.user()?.name?.charAt(0)||'A'}}</div><div><b>{{auth.user()?.name||'Administrator'}}</b><small>Administrator</small></div></div>
    </mat-toolbar>
    <div class="content"><router-outlet/></div>
   </mat-sidenav-content>
  </mat-sidenav-container>
 </ng-container>
 <ng-template #loginLayout><router-outlet/></ng-template>
 `
})
export class AppComponent{auth=inject(AdminAuthService)}