import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService, Category } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="post-wrapper fade-in">
      <div class="container main-container">

        <div class="card retail-post-card">
          <div class="post-header">
            <h2>Post a New Product</h2>
            <p>Fill in details to list your item on SRMKart.</p>
          </div>

          <div *ngIf="error" class="alert alert-danger">
            <span class="material-icons alert-icon">error_outline</span>
            {{error}}
          </div>

          <form (ngSubmit)="onSubmit()" #postForm="ngForm" class="retail-form">
            <div class="form-group mb-3">
              <label class="form-label">Product Title *</label>
              <input type="text" class="form-control" name="title" [(ngModel)]="listing.title" required placeholder="e.g. Casio Scientific Calculator">
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Price (₹) *</label>
                <input type="number" class="form-control" name="price" [(ngModel)]="listing.price" required min="1">
              </div>
              
              <div class="form-group flex-1">
                 <label class="form-label">Category *</label>
                 <select class="form-control" name="categoryId" [(ngModel)]="listing.categoryId" required>
                   <option value="0" disabled>Select Category</option>
                   <option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</option>
                 </select>
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Condition *</label>
              <select class="form-control" name="conditionStatus" [(ngModel)]="listing.conditionStatus" required>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>            <div class="form-group mb-3">
              <label class="form-label">Description *</label>
              <textarea class="form-control" name="description" [(ngModel)]="listing.description" required rows="4" placeholder="Provide details like expected usage, any damages, etc."></textarea>
            </div>
            
            <div class="form-group upload-group mb-4">
              <label class="form-label">Product Images (Up to 4) *</label>
              
              <div class="multi-upload-grid">
                <!-- Image Slots -->
                <div *ngFor="let preview of imagePreviews; let i = index" class="upload-slot preview-slot">
                  <img [src]="preview" alt="preview" class="slot-image">
                  <button type="button" class="remove-slot" (click)="removeImage(i)">×</button>
                  <div class="slot-number">{{i + 1}}</div>
                </div>

                <!-- Add More Slot -->
                <div *ngIf="imagePreviews.length < 4" 
                     class="upload-slot add-slot"
                     [class.drag-over]="isDragging"
                     (dragover)="onDragOver($event)" 
                     (dragleave)="onDragLeave($event)" 
                     (drop)="onDrop($event)"
                     (click)="fileInput.click()">
                  <span class="material-icons">add_a_photo</span>
                  <p>Add Image</p>
                  <input type="file" class="hidden-input" (change)="onFileSelected($event)" accept="image/*" #fileInput multiple>
                </div>
              </div>
              
              <p class="upload-hint mt-2">Maximum 4 images. Supports: JPG, PNG, WEBP (Max 5MB each)</p>
            </div>

            <hr class="divider">

            <div class="retail-actions">
              <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="!postForm.form.valid || loading || listing.categoryId === 0 || imagePreviews.length === 0">
                <span *ngIf="!loading">Publish Product</span>
                <span *ngIf="loading" class="material-icons rotating">autorenew</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .post-wrapper {
      background-color: var(--bg-main);
      min-height: calc(100vh - 80px);
      padding: 4rem 1rem;
    }
    
    .retail-post-card {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 3.5rem 3rem;
      background: var(--bg-card);
    }

    .post-header {
      margin-bottom: 2.5rem;
      text-align: center;
    }

    .post-header h2 {
      font-size: 2.2rem;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      margin-bottom: 0.5rem;
    }

    .post-header p {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .flex-1 { flex: 1; }

    .divider {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 2.5rem 0;
    }

    .btn-lg {
      padding: 1.2rem;
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .alert-danger {
      background-color: #fee2e2;
      color: var(--danger);
      border: 1px solid #f87171;
      padding: 1rem;
      display: flex; gap: 10px;
      border-radius: var(--radius-sm);
      margin-bottom: 2rem;
    }

    .multi-upload-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 15px;
      margin-top: 10px;
    }

    .upload-slot {
      aspect-ratio: 1/1;
      border-radius: 12px;
      border: 2px dashed #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      background: #f8fafc;
      transition: all 0.2s;
      overflow: hidden;
    }

    .add-slot:hover {
      border-color: #312e81;
      background: #f1f5ff;
      color: #312e81;
    }

    .add-slot .material-icons { font-size: 2rem; margin-bottom: 5px; color: #94a3b8; }
    .add-slot p { font-size: 0.85rem; font-weight: 600; margin: 0; color: #64748b; }

    .preview-slot { border: none; background: #f3f4f6; }
    .slot-image { width: 100%; height: 100%; object-fit: cover; }

    .remove-slot {
      position: absolute;
      top: 5px; right: 5px;
      width: 24px; height: 24px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.7);
      color: white; border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1.2rem;
    }

    .slot-number {
      position: absolute;
      bottom: 5px; left: 5px;
      background: rgba(49, 46, 129, 0.8);
      color: white; padding: 2px 8px;
      border-radius: 10px; font-size: 0.7rem; font-weight: 700;
    }

    .hidden-input { display: none; }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; gap: 1.5rem; }
      .retail-post-card { padding: 2rem 1.5rem; }
      .multi-upload-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class PostListingComponent implements OnInit {
  categories: Category[] = [];
  listing = {
    title: '',
    price: 0,
    categoryId: 0,
    conditionStatus: 'Good',
    description: '',
    imageUrls: [] as string[]
  };
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isDragging = false;
  loading = false;
  error = '';

  constructor(
    private listingService: ListingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.listingService.getCategories().subscribe(res => {
      this.categories = res || [];
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  handleFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      if (this.selectedFiles.length >= 4) break;
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    const formData = new FormData();
    formData.append('listing', JSON.stringify(this.listing));
    
    this.selectedFiles.forEach((file, index) => {
      formData.append(`image${index}`, file, file.name);
    });
    
    this.listingService.createListingWithImage(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/listing', res.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to post listing. Please try again.';
        console.error('Listing post error:', err);
      }
    });
  }
}
