import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `<div class="page narrow checkout-success"><span class="eyebrow">ORDER</span><h1>Thank you</h1><p>Your checkout has been completed or is being processed by Fastrr. Your payment, COD and delivery details are handled inside the Shiprocket Fastrr checkout.</p><a mat-flat-button class="primary-btn" routerLink="/products">Continue shopping</a></div>`
})
export class CheckoutComponent {}
