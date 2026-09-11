import {Component, Inject, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AdminApiService} from '../../core/services';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in sync with backend MAX_UPLOAD_BYTES
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{data ? 'Edit product' : 'Add product'}}</h2>
    <div mat-dialog-content class="form-grid">
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="form.name" required>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>SKU</mat-label>
        <input matInput [(ngModel)]="form.sku" required>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Category</mat-label>
        <mat-select [(ngModel)]="form.category_id" required>
          <mat-option *ngFor="let c of categories" [value]="c.id">{{c.name}}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Price (₹)</mat-label>
        <input matInput type="number" min="0" step="0.01" [(ngModel)]="form.price" required>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Discount price (₹, optional)</mat-label>
        <input matInput type="number" min="0" step="0.01" [(ngModel)]="form.discount_price">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Stock</mat-label>
        <input matInput type="number" min="0" [(ngModel)]="form.stock" required>
      </mat-form-field>

      <div class="full image-block">
        <label class="image-label">Product image</label>
        <div class="image-row">
          <div class="preview" [class.empty]="!form.image">
            <img *ngIf="form.image" [src]="form.image" alt="">
            <span *ngIf="!form.image">No image</span>
          </div>

          <div class="image-actions" *ngIf="data; else createHint">
            <input #fileInput type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden
                   (change)="onFileSelected($event)">
            <button mat-stroked-button type="button" (click)="fileInput.click()" [disabled]="uploadingImage">
              <mat-spinner *ngIf="uploadingImage" diameter="16" style="display:inline-block;vertical-align:middle;margin-right:6px"></mat-spinner>
              {{form.image ? 'Replace image' : 'Upload image'}}
            </button>
            <button mat-button color="warn" type="button" *ngIf="form.image" (click)="removeImage()" [disabled]="uploadingImage">
              Remove
            </button>
            <p class="hint">JPEG, PNG, GIF or WEBP, up to 5MB.</p>
            <p class="error" *ngIf="imageError">{{imageError}}</p>
          </div>
          <ng-template #createHint>
            <p class="hint">Save the product first, then reopen it here to upload an image.</p>
          </ng-template>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Or paste an external image URL</mat-label>
          <input matInput [(ngModel)]="form.image" placeholder="https://...">
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Description</mat-label>
        <textarea matInput rows="3" [(ngModel)]="form.description"></textarea>
      </mat-form-field>

      <mat-checkbox [(ngModel)]="form.featured">Featured</mat-checkbox>
      <mat-checkbox [(ngModel)]="form.status">Active (visible in the store)</mat-checkbox>

      <p class="error full" *ngIf="error">{{error}}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(imageChanged)" [disabled]="saving">
        {{imageChanged ? 'Close' : 'Cancel'}}
      </button>
      <button mat-flat-button class="dark-btn" (click)="save()" [disabled]="saving || !valid()">
        <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;vertical-align:middle"></mat-spinner>
        <span *ngIf="!saving">{{data ? 'Save changes' : 'Create product'}}</span>
      </button>
    </div>
  `,
  styles: [`
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;min-width:420px;max-width:560px}
    .full{grid-column:1/-1}
    .error{color:#c0392b;margin:4px 0 0}
    .image-block{margin-bottom:8px}
    .image-label{font-size:12px;font-weight:600;letter-spacing:.04em;color:rgba(0,0,0,.6);display:block;margin-bottom:6px}
    .image-row{display:flex;gap:16px;align-items:flex-start;margin-bottom:8px}
    .preview{width:88px;height:88px;border-radius:8px;border:1px dashed rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:#fafafa}
    .preview img{width:100%;height:100%;object-fit:cover}
    .preview.empty span{font-size:11px;color:rgba(0,0,0,.4)}
    .image-actions{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
    .hint{font-size:12px;color:rgba(0,0,0,.5);margin:4px 0 0;width:100%}
  `],
})
export class ProductFormComponent {
  private api = inject(AdminApiService);
  ref = inject(MatDialogRef<ProductFormComponent>);
  categories: any[] = [];
  saving = false;
  uploadingImage = false;
  error = '';
  imageError = '';
  imageChanged = false;
  form: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = data ? {
      name: data.name,
      sku: data.sku,
      category_id: data.category_id,
      price: data.price,
      discount_price: data.discount_price,
      stock: data.stock,
      image: data.image,
      description: data.description,
      featured: !!data.featured,
      status: data.status !== false,
    } : {
      name: '', sku: '', category_id: null, price: null, discount_price: null,
      stock: 0, image: '', description: '', featured: false, status: true,
    };
    this.api.categories().subscribe(r => this.categories = r.data || []);
  }

  valid(): boolean {
    return !!this.form.name && !!this.form.sku && !!this.form.category_id
      && this.form.price !== null && this.form.price !== ''
      && this.form.stock !== null && this.form.stock !== '';
  }

  onFileSelected(event: Event): void {
    this.imageError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.imageError = 'Unsupported file type. Use JPEG, PNG, GIF, or WEBP.';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError = 'Image must be smaller than 5MB.';
      return;
    }

    this.uploadingImage = true;
    this.api.uploadProductImage(this.data.id, file).subscribe({
      next: (r) => {
        this.uploadingImage = false;
        this.form.image = r.data.image;
        this.imageChanged = true;
      },
      error: (e) => {
        this.uploadingImage = false;
        this.imageError = e?.error?.detail || 'Upload failed. Please try again.';
      },
    });
  }

  removeImage(): void {
    this.uploadingImage = true;
    this.imageError = '';
    this.api.removeProductImage(this.data.id).subscribe({
      next: () => {
        this.uploadingImage = false;
        this.form.image = null;
        this.imageChanged = true;
      },
      error: (e) => {
        this.uploadingImage = false;
        this.imageError = e?.error?.detail || 'Could not remove image. Please try again.';
      },
    });
  }

  save(): void {
    this.saving = true;
    this.error = '';
    const payload = {...this.form};
    if (payload.discount_price === '' || payload.discount_price === undefined) {
      payload.discount_price = null;
    }
    const req = this.data
      ? this.api.updateProduct(this.data.id, payload)
      : this.api.createProduct(payload);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.ref.close(true);
      },
      error: (e) => {
        this.saving = false;
        this.error = e?.error?.detail || 'Something went wrong. Please try again.';
      },
    });
  }
}
