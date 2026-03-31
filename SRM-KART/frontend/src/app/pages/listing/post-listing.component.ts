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
            
            <div class="form-group upload-group mb-3">
              <label class="form-label">Product Image *</label>
              <div class="file-upload-box">
                <span class="material-icons upload-icon">cloud_upload</span>
                <p>Drag and drop or click to upload</p>
                <input type="file" class="file-input" (change)="onFileSelected($event)" accept="image/*" required>
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
      border: 2px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 3rem 1.5rem;
      text-align: center;
      position: relative;
      background: var(--bg-main);
      transition: all 0.2s;
    }

    .file-upload-box:hover {
      border-color: var(--primary-color);
      background: #f1f3f5;
    }

    .upload-icon {
      font-size: 3rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .file-input {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
    }

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
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
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
