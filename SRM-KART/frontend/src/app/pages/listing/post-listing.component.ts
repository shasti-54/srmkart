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
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Description *</label>
              <textarea class="form-control" name="description" [(ngModel)]="listing.description" required rows="5" placeholder="Provide details like expected usage, any damages, etc."></textarea>
            </div>
            
            <div class="form-group upload-group mb-4">
              <label class="form-label">Product Image *</label>
              
              <!-- Drag and Drop Box -->
              <div class="file-upload-box" 
                   [class.drag-over]="isDragging"
                   (dragover)="onDragOver($event)" 
                   (dragleave)="onDragLeave($event)" 
                   (drop)="onDrop($event)">
                
                <div *ngIf="!imagePreview" class="upload-placeholder">
                  <span class="material-icons upload-icon">cloud_upload</span>
                  <p class="upload-text">Drag and drop or <span class="text-primary">click to browse</span></p>
                  <p class="upload-hint">Supports: JPG, PNG, WEBP (Max 5MB)</p>
                </div>

                <div *ngIf="imagePreview" class="upload-preview-container">
                  <img [src]="imagePreview" alt="preview" class="image-preview">
                  <div class="preview-overlay">
                    <span class="material-icons">refresh</span>
                    <p>Click to change image</p>
                  </div>
                </div>

                <input type="file" class="file-input" (change)="onFileSelected($event)" accept="image/*" #fileInput>
              </div>
              
              <div *ngIf="selectedFile" class="file-name-tag">
                <span class="material-icons">image</span>
                {{selectedFile.name}}
                <button type="button" class="btn-remove" (click)="clearFile($event)">×</button>
              </div>
            </div>

            <hr class="divider">

            <div class="retail-actions">
              <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="!postForm.form.valid || loading || listing.categoryId === 0">
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

    .file-upload-box {
      border: 3px dashed #e2e8f0;
      border-radius: 20px;
      padding: 3rem 1.5rem;
      text-align: center;
      position: relative;
      background: #f8fafc;
      transition: all 0.3s ease;
      cursor: pointer;
      overflow: hidden;
    }

    .file-upload-box:hover, .file-upload-box.drag-over {
      border-color: #312e81;
      background: #f1f5ff;
    }

    .file-upload-box.drag-over {
      transform: scale(1.02);
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    }

    .upload-icon {
      font-size: 3.5rem;
      color: #94a3b8;
      margin-bottom: 1rem;
      transition: transform 0.3s ease;
    }
    .file-upload-box:hover .upload-icon { transform: translateY(-5px); color: #312e81; }

    .upload-text { font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-bottom: 5px; }
    .upload-hint { font-size: 0.85rem; color: #64748b; }
    .text-primary { color: #312e81; text-decoration: underline; }

    /* Preview Component */
    .upload-preview-container {
      width: 100%;
      height: 100%;
      min-height: 200px;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
    }
    .image-preview {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
    }
    .preview-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(49, 46, 129, 0.7);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .upload-preview-container:hover .preview-overlay { opacity: 1; }

    .file-input {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0;
      cursor: pointer;
      z-index: 10;
    }

    .file-name-tag {
      margin-top: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: #f1f5f9;
      border-radius: 20px;
      font-size: 0.9rem;
      color: #334155;
      font-weight: 500;
    }
    .btn-remove {
      background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; line-height: 1;
    }
    .btn-remove:hover { color: #ef4444; }

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

    @media (max-width: 768px) {
      .form-row { flex-direction: column; gap: 1.5rem; }
      .retail-post-card { padding: 2rem 1.5rem; }
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
    imageUrl: ''
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;
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
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
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
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.error = 'Please upload an image file.';
      return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    const formData = new FormData();
    formData.append('listing', JSON.stringify(this.listing));
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    
    this.listingService.createListingWithImage(formData).subscribe({
      next: (res) => {
        this.loading = false;
        // Redirect to detail page
        this.router.navigate(['/listing', res.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to post listing. Please try again.';
      }
    });
  }
}
