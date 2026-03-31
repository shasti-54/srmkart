import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ListingService, Listing } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="retail-detail-wrapper fade-in">
      <div class="container main-container">
        
        <div *ngIf="loading" class="loading-spinner">
          <div class="spinner"></div>
        </div>
        
        <div *ngIf="error" class="alert alert-danger">{{error}}</div>

        <div *ngIf="listing && !loading" class="retail-grid">
          
          <!-- Image Gallery Section -->
          <div class="retail-gallery">
            <div class="main-image-container">
              <img [src]="listing.imageUrl || 'assets/placeholder-item.png'" 
                   onerror="this.src='https://placehold.co/600x600/f8f9fc/111827?text=No+Image'" 
                   alt="{{listing.title}}" class="main-image">
              <div class="absolute-badge" *ngIf="listing.conditionStatus === 'NEW'">NEW</div>
            </div>
          </div>

          <!-- Product Details Section -->
          <div class="retail-info">
            <div class="breadcrumb">
              <a routerLink="/" class="breadcrumb-link">Home</a> / 
              <a [routerLink]="['/search']" [queryParams]="{category: listing.categoryId}" class="breadcrumb-link">{{listing.categoryName}}</a> / 
              <span class="active">{{listing.title}}</span>
            </div>

            <div class="product-brand">SRM ESSENTIALS</div>
            <h1 class="product-title">{{listing.title}}</h1>
            
            <div class="price-section">
              <h2 class="price-amount">₹{{listing.price}}</h2>
              <span class="tax-inclusive">Inclusive of all campus taxes</span>
            </div>

            <div class="condition-box">
              <span class="condition-label">Condition:</span>
              <span class="condition-value">{{listing.conditionStatus}}</span>
            </div>

            <div class="action-row">
              <button class="btn btn-primary btn-lg action-btn" (click)="messageSeller()">
                <span class="material-icons">chat</span> Message Seller
              </button>
              <button class="btn btn-outline btn-lg action-btn" (click)="addToWishlist()">
                <span class="material-icons">favorite_border</span> Save
              </button>
            </div>

            <hr class="divider">

            <div class="product-description-container">
              <h3>Product Details</h3>
              <p class="description-text">{{listing.description}}</p>
            </div>

            <div class="seller-retail-card">
              <h4>Sold By</h4>
              <div class="seller-info-row">
                <div class="seller-avatar">
                  <span class="material-icons">storefront</span>
                </div>
                <div>
                  <p class="seller-name">{{listing.sellerName}}</p>
                  <p class="seller-date">Listed on {{listing.createdAt | date:'mediumDate'}}</p>
                </div>
              </div>
              <div class="seller-trust">
                <span class="material-icons text-success">verified</span> 100% Verified Student
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .retail-detail-wrapper {
      background-color: var(--bg-card);
      min-height: calc(100vh - 80px);
      padding: 3rem 0 6rem;
    }
    
    .loading-spinner { padding: 5rem 0; text-align: center; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .retail-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: start;
    }
    @media (min-width: 900px) {
      .retail-grid { grid-template-columns: 1fr 1fr; gap: 4rem; }
    }
    
    /* Gallery */
    .retail-gallery {
      width: 100%;
    }
    .main-image-container {
      background-color: var(--bg-main);
      position: relative;
      height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }
    .main-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .absolute-badge {
      position: absolute;
      top: 15px; left: 15px;
      background: var(--text-main);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 5px 10px;
      letter-spacing: 1px;
    }

    /* Product Info */
    .retail-info {
      padding: 1rem 0;
    }
    
    .breadcrumb {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .breadcrumb-link { color: var(--text-muted); text-decoration: none; }
    .breadcrumb-link:hover { color: var(--primary-color); text-decoration: underline; }
    .breadcrumb .active { color: var(--text-darker); font-weight: 500; }

    .product-brand {
      color: var(--text-muted);
      font-size: 0.9rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .product-title {
      font-size: 2rem;
      font-weight: 400;
      color: var(--text-main);
      line-height: 1.3;
      margin-bottom: 1.5rem;
    }
    
    .price-section {
      margin-bottom: 2rem;
    }
    .price-amount {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }
    .tax-inclusive {
      font-size: 0.85rem;
      color: var(--success);
      font-weight: 500;
    }

    .condition-box {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-main);
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      margin-bottom: 2.5rem;
    }
    .condition-label { color: var(--text-darker); font-size: 0.9rem; }
    .condition-value { font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }

    .action-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-lg { padding: 1.2rem; font-size: 1.05rem; }

    .divider {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 2.5rem 0;
    }

    .product-description-container h3 {
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .description-text {
      white-space: pre-line;
      color: var(--text-darker);
      font-size: 1rem;
      line-height: 1.7;
    }

    /* Seller Info */
    .seller-retail-card {
      margin-top: 3rem;
      background: #fdfdfd;
      border: 1px solid var(--border-color);
      padding: 1.5rem;
    }
    .seller-retail-card h4 {
      font-size: 1rem;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 1rem;
      letter-spacing: 0.5px;
    }
    .seller-info-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .seller-avatar {
      width: 50px; height: 50px;
      background: var(--bg-main);
      border-radius: 50%;
      border: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
    }
    .seller-avatar .material-icons { font-size: 1.8rem; }
    .seller-name { font-weight: 700; font-size: 1.1rem; color: var(--text-main); }
    .seller-date { color: var(--text-muted); font-size: 0.85rem; }
    .seller-trust {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.85rem; color: var(--success); font-weight: 600;
    }
    .text-success { color: var(--success); font-size: 1.1rem; }

    @media (max-width: 900px) {
      .main-image-container { height: 400px; }
      .action-row { flex-direction: column; }
    }
  `]
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute, 
    private listingService: ListingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.listingService.getListingById(+id).subscribe({
        next: (data) => {
          this.listing = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Listing not found.';
          this.loading = false;
        }
      });
    }
  }

  messageSeller() {
    if (!this.authService.getToken()) {
      alert("Please login to message the seller.");
      this.router.navigate(['/login']);
      return;
    }
    
    if (this.listing) {
      // Navigate to inbox with query parameters to start a new thread
      const receiverId = this.listing['userId'] || 2; // Fallback to 2 if API doesn't return seller ID natively
      this.router.navigate(['/inbox'], { 
        queryParams: { 
          listingId: this.listing.id, 
          receiverId: receiverId 
        } 
      });
    }
  }

  addToWishlist() {
    if (!this.authService.getToken()) {
      alert("Please login to add to wishlist.");
      return;
    }
    alert("Added to wishlist!");
  }
}
