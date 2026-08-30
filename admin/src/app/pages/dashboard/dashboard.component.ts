import {Component,inject} from '@angular/core';
import {CommonModule} from '@angular/common';import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';import {MatIconModule} from '@angular/material/icon';import {MatButtonModule} from '@angular/material/button';import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';import {MatChipsModule} from '@angular/material/chips';
import {AdminApiService} from '../../core/services';

@Component({standalone:true,imports:[CommonModule,RouterLink,MatCardModule,MatIconModule,MatButtonModule,MatProgressSpinnerModule,MatChipsModule],
template:`<div class="page-head">
  <div>
    <span class="eyebrow">OVERVIEW</span>
    <h1>Good day, Admin.</h1>
    <p>Here's what's happening with your store today.</p>
  </div>

  <a
    mat-flat-button
    class="dark-btn"
    routerLink="/products">
    <mat-icon>add</mat-icon>
    Add product
  </a>
</div>

<div class="stat-grid">
  <mat-card
    class="stat-card"
    *ngFor="let s of stats">

    <div class="stat-icon">
      <mat-icon>{{ s.icon }}</mat-icon>
    </div>

    <span>{{ s.label }}</span>

    <strong>{{ s.value }}</strong>

    <small>{{ s.note }}</small>

  </mat-card>
</div>

<div class="dashboard-grid">

  <!-- Recent Orders -->
  <mat-card class="panel">

    <div class="panel-head">
      <div>
        <h3>Recent orders</h3>
        <span>Latest customer activity</span>
      </div>

      <a
        mat-button
        routerLink="/orders">
        View all
      </a>
    </div>

    <div
      class="order-item"
      *ngFor="let o of recentOrders">

      <div class="order-avatar">
        {{ o.order_number?.slice(-2) || 'OR' }}
      </div>

      <div class="order-main">
        <b>{{ o.order_number || 'Order' }}</b>
        <span>{{ o.user?.name || 'Customer' }}</span>
      </div>

      <div class="order-total">
        ₹{{ o.total || 0 }}
      </div>

      <mat-chip>
        {{ o.order_status || 'Pending' }}
      </mat-chip>

    </div>

    <div
      class="empty-mini"
      *ngIf="!recentOrders.length">

      No recent orders found.

    </div>

  </mat-card>


  <!-- Quick Actions -->
  <mat-card class="panel">

    <div class="panel-head">
      <div>
        <h3>Quick actions</h3>
        <span>Manage your store</span>
      </div>
    </div>


    <a
      class="quick"
      routerLink="/products">

      <mat-icon>inventory_2</mat-icon>

      <div>
        <b>Products</b>
        <span>Add, edit or manage stock</span>
      </div>

      <mat-icon>chevron_right</mat-icon>

    </a>


    <a
      class="quick"
      routerLink="/orders">

      <mat-icon>local_shipping</mat-icon>

      <div>
        <b>Orders</b>
        <span>Process and update orders</span>
      </div>

      <mat-icon>chevron_right</mat-icon>

    </a>


    <a
      class="quick"
      routerLink="/customers">

      <mat-icon>people</mat-icon>

      <div>
        <b>Customers</b>
        <span>View customer accounts</span>
      </div>

      <mat-icon>chevron_right</mat-icon>

    </a>

  </mat-card>

</div>`
})
export class DashboardComponent{
 api=inject(AdminApiService);stats:any[]=[];recentOrders:any[]=[];
 constructor() {
  this.api.dashboard().subscribe({
    next: (response) => {
      this.map(response?.data);
    },
    error: (error) => {
      console.error('Dashboard API error:', error);
      this.fallback();
    }
  });
}

map(data: any): void {
  this.stats = [
    {
      label: 'Orders',
      value: data?.total_orders ?? 0,
      icon: 'shopping_bag',
      note: 'All orders'
    },
    {
      label: 'Sales',
      value: data?.total_sales ?? '₹0',
      icon: 'payments',
      note: 'Gross sales'
    },
    {
      label: 'Customers',
      value: data?.total_customers ?? 0,
      icon: 'people',
      note: 'Registered'
    },
    {
      label: 'Products',
      value: data?.total_products ?? 0,
      icon: 'inventory_2',
      note: 'Catalog'
    }
  ];

  this.recentOrders = data?.recent_orders ?? [];
}

fallback(): void {
  this.stats = [
    {
      label: 'Orders',
      value: 0,
      icon: 'shopping_bag',
      note: 'All orders'
    },
    {
      label: 'Sales',
      value: '₹0',
      icon: 'payments',
      note: 'Gross sales'
    },
    {
      label: 'Customers',
      value: 0,
      icon: 'people',
      note: 'Registered'
    },
    {
      label: 'Products',
      value: 0,
      icon: 'inventory_2',
      note: 'Catalog'
    }
  ];

  this.recentOrders = [];
}
}