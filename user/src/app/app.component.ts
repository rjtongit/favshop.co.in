import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterOutlet } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import { MatMenuModule } from "@angular/material/menu";
import { AuthService, CartService } from "./core/services";
import { ChatbotComponent } from "./pages/chatbot/chatbot.component";
@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    ChatbotComponent
  ],
  template: `<app-chatbot></app-chatbot> <mat-toolbar class="topbar"
      ><div class="nav-wrap">
        <a routerLink="/" class="brand"
          ><span class="brand-mark">ॐ</span><span>FavShop</span></a
        >
        <nav class="desktop-nav">
          <a routerLink="/products">Shop</a
          ><a routerLink="/products">New Arrivals</a
          ><a routerLink="/products">Puja Essentials</a
          ><a routerLink="/">Nabadwip Dham Darshan</a>
        </nav>
        <span class="spacer"></span
        ><a mat-icon-button routerLink="/products" aria-label="Search"
          ><mat-icon>search</mat-icon></a
        >
        <a
          mat-icon-button
          routerLink="/cart"
          [matBadge]="cart.count$.value || null"
          matBadgeColor="warn"
          ><mat-icon>shopping_bag</mat-icon></a
        >
        <button mat-icon-button [matMenuTriggerFor]="accountMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #accountMenu="matMenu"
          ><ng-container *ngIf="auth.user(); else guest"
            ><button mat-menu-item routerLink="/account">My Account</button
            ><button mat-menu-item routerLink="/orders">Orders</button
            ><button mat-menu-item (click)="auth.logout()">
              Logout
            </button></ng-container
          ><ng-template #guest
            ><button mat-menu-item routerLink="/login">Login</button
            ><button mat-menu-item routerLink="/register">
              Create Account
            </button></ng-template
          ></mat-menu
        >
      </div></mat-toolbar
    >
    <main><router-outlet /></main>
    <footer>
      <div class="footer-wrap">
        <div>
          <div class="brand footer-brand">ॐ FavShop</div>
          <p>
            Thoughtfully selected devotional products for your home, temple and
            celebrations.
          </p>
        </div>
        <div>
          <b>Shop</b><a routerLink="/products">All Products</a
          ><a routerLink="/products">Puja Essentials</a>
        </div>
        <div>
          <b>Support</b><a routerLink="/account">My Account</a
          ><a routerLink="/orders">Orders</a>
        </div>
      </div>
      <div class="copyright">© 2026 FavShop. Made with devotion.</div>
    </footer>`,
})
export class AppComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}
