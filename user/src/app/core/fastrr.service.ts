import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './api';

declare global {
  interface Window {
    HeadlessCheckout?: {
      addToCart: (event: Event, token: string, options?: { fallbackUrl?: string; isInitiatedFromApp?: boolean }) => void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class FastrrService {
  private http = inject(HttpClient);

  startCheckout(items: Array<{ variant_id: number | string; quantity: number }>) {
    return this.http.post<any>(`${API}/fastrr/checkout/start`, { items });
  }

  launch(event: Event, token: string) {
    if (!window.HeadlessCheckout?.addToCart) {
      throw new Error('Fastrr Checkout script is not loaded. Check your internet connection and index.html configuration.');
    }
    window.HeadlessCheckout.addToCart(event, token, {
      fallbackUrl: '/cart',
      isInitiatedFromApp: false,
    });
  }
}
