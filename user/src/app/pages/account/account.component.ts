import { Component, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; 
import { MatCardModule } from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button'; 
import { AuthService } from '../../core/services';
@Component(
    { 
        standalone: true, 
        imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule], 
        template: `<div class="page narrow"><div class="page-title"><span class="eyebrow">MY FAVSHOP</span><h1>Account</h1></div><mat-card class="account-card"><div class="avatar">{{user?.name?.charAt(0)||'U'}}</div><h2>{{user?.name||'Guest'}}</h2><p>{{user?.email}}</p><a mat-stroked-button routerLink="/orders">View my orders</a><button mat-button (click)="auth.logout()">Sign out</button></mat-card></div>` 
    }
)
export class AccountComponent {
  auth = inject(AuthService);
  user = this.auth.user();
}