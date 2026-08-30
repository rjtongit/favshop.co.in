import {Component,inject} from '@angular/core';
import {CommonModule} from '@angular/common';import {FormsModule} from '@angular/forms';import {Router,RouterLink} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';import {MatInputModule} from '@angular/material/input';import {MatButtonModule} from '@angular/material/button';import {MatIconModule} from '@angular/material/icon';
import {AdminAuthService} from '../../core/services';

@Component({
 standalone:true,
 imports:[CommonModule,FormsModule,RouterLink,MatFormFieldModule,MatInputModule,MatButtonModule,MatIconModule],
 template:`
 <div class="login-page">
  <div class="login-visual"><div class="visual-mark">ॐ</div><span>FAVSHOP</span><h1>Manage your<br><em>devotional store.</em></h1><p>Everything you need to manage products, orders and customers in one simple workspace.</p></div>
  <div class="login-panel"><div class="login-box"><div class="login-logo">ॐ</div><span class="eyebrow">ADMIN CONSOLE</span><h2>Welcome back</h2><p>Sign in to continue to your dashboard.</p>
   <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" [(ngModel)]="email" (keyup.enter)="login()"></mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Password</mat-label><input matInput type="password" [(ngModel)]="password" (keyup.enter)="login()"></mat-form-field>
   <button mat-flat-button class="login-btn" (click)="login()">Sign in <mat-icon>arrow_forward</mat-icon></button>
   <div class="error">{{error}}</div>
   <small>Admin access only</small>
  </div></div>
 </div>`
})
export class AdminLoginComponent{
 email='admin@favshop.local';password='Admin@12345';error='';
 auth=inject(AdminAuthService);router=inject(Router);
 login(){this.error='';this.auth.login({email:this.email,password:this.password}).subscribe({next:r=>{if(r.data?.user?.role!=='admin'){this.error='This account does not have administrator access.';return}this.auth.save(r);this.router.navigateByUrl('/')},error:e=>this.error=e.error?.detail||e.error?.message||'Invalid email or password'})}
}