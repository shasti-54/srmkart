import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ListingService, Listing } from '../../services/listing.service';
import { WishlistService } from '../../services/wishlist.service';
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
          <p>Fetching product details...</p>
        </div>
        
        <div *ngIf="error" class="alert alert-danger">{{error}}</div>

        <div *ngIf="listing && !loading" class="concept-product-grid card">
          
          <!-- Left Column: Gallery -->
          <div class="gallery-col">
            <div class="main-stage">
              <img [src]="listing.imageUrl || 'assets/placeholder-item.png'" 
                   onerror="this.src='https://placehold.co/600x600/f8f9fc/111827?text=No+Image'" 
                   alt="{{listing.title}}" class="featured-image">
              <div class="featured-badge">FEATURED</div>
            </div>
            
            <div class="thumbnail-row">
              <div class="thumb active">
                <img [src]="listing.imageUrl || 'assets/placeholder-item.png'" 
                     onerror="this.src='https://placehold.co/100x100/f8f9fc/111827?text=Img'" alt="thumb">
              </div>
              <div class="thumb" *ngFor="let i of [1,2,3]">
                <img src="https://placehold.co/100x100/f8f9fc/111827?text=Preview" alt="mock">
              </div>
            </div>
          </div>

          <!-- Right Column: Info -->
          <div class="info-col">
            <div class="badge-row">
              <span class="concept-badge cat-badge">
                <span class="material-icons info-icon">category</span>
                {{listing.categoryName || 'General'}}
              </span>
              <span class="concept-badge condition-badge">
                 <span class="material-icons info-icon">check_circle</span>
                 {{listing.conditionStatus === 'NEW' ? 'Brand New' : listing.conditionStatus + ' condition'}}
              </span>
            </div>

            <h1 class="concept-title">{{listing.title}}</h1>

            <div class="concept-price-row">
              <div class="price-main">₹{{listing.price}}</div>
              <div class="price-old" *ngIf="listing.price > 100">₹{{listing.price + 400}}</div>
              <div class="save-tag" *ngIf="listing.price > 100">Save 63%</div>
            </div>

            <p class="concept-description">{{listing.description}}</p>

            <div class="seller-card-minimal">
               <div class="seller-avatar-initial">{{ (listing.sellerName || 'S').charAt(0).toUpperCase() }}</div>
               <div class="seller-meta">
                  <div class="seller-primary">{{listing.sellerName}} · <span class="year-text">3rd Year CSE</span></div>
                  <div class="seller-stats">
                    <span class="stars">★★★★★</span>
                    <span class="stat-detail">4.9 · 12 sales · Active today</span>
                  </div>
               </div>
            </div>

            <div class="action-buttons">
               <button class="btn btn-indigo btn-large" (click)="messageSeller()">
                  <span class="material-icons">message</span> Message Seller
               </button>
               <button class="btn btn-outline-white wishlist-circle" (click)="toggleWishlist()">
                  <span class="material-icons" [style.color]="isSaved() ? '#ef4444' : '#111827'">
                    {{ isSaved() ? 'favorite' : 'favorite_border' }}
                  </span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .retail-detail-wrapper {
      padding: 3rem 0;
      background: #f8fafc;
      min-height: calc(100vh - 80px);
    }

    .loading-spinner { text-align: center; padding: 10rem 0; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #312e81;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Concept Card */
    .concept-product-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 0;
      background: #ffffff;
      border-radius: 32px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 50px rgba(0,0,0,0.04);
      padding: 2rem;
    }

    /* Gallery */
    .gallery-col {
      padding: 1rem;
    }
    .main-stage {
      aspect-ratio: 1/1;
      background: #f3f5ff;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      margin-bottom: 1.5rem;
      border: 1px solid #ebedff;
    }
    .featured-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      padding: 3rem;
    }
    .featured-badge {
      position: absolute;
      bottom: 20px;
      background: #312e81;
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 20px;
      letter-spacing: 1px;
    }

    .thumbnail-row {
      display: flex;
      gap: 12px;
    }
    .thumb {
      width: 90px;
      height: 90px;
      background: #f3f5ff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid transparent;
      padding: 10px;
    }
    .thumb img { max-width: 100%; max-height: 100%; object-fit: contain; opacity: 0.7; }
    .thumb.active { border-color: #312e81; }
    .thumb.active img { opacity: 1; }

    /* Info */
    .info-col {
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: column;
    }

    .badge-row {
      display: flex;
      gap: 10px;
      margin-bottom: 2rem;
    }
    .concept-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .cat-badge { background: #ede9fe; color: #5b21b6; }
    .condition-badge { background: #f0fdf4; color: #166534; }
    .info-icon { font-size: 1.1rem; }

    .concept-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2.75rem;
      font-weight: 800;
      color: #111827;
      line-height: 1.1;
      letter-spacing: -1.5px;
      margin-bottom: 1.5rem;
    }

    .concept-price-row {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 2rem;
    }
    .price-main {
      font-family: 'Outfit', sans-serif;
      font-size: 3rem;
      font-weight: 900;
      color: #312e81;
      letter-spacing: -2px;
    }
    .price-old {
      font-size: 1.25rem;
      color: #94a3b8;
      text-decoration: line-through;
    }
    .save-tag {
      background: #fef3c7;
      color: #92400e;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .concept-description {
      font-size: 1.15rem;
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 2.5rem;
      white-space: pre-wrap;
    }

    /* Seller Minimal Card */
    .seller-card-minimal {
      background: #f5f3ff;
      padding: 1.5rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 2rem;
    }
    .seller-avatar-initial {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #312e81;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
    }
    .seller-primary {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e1b4b;
    }
    .year-text { font-weight: 400; color: #4338ca; }
    .stars { color: #f59e0b; font-size: 0.9rem; margin-right: 8px; }
    .stat-detail { font-size: 0.85rem; color: #6366f1; font-weight: 500; }

    /* Actions */
    .action-buttons {
      display: flex;
      gap: 15px;
    }
    .btn-indigo {
      background: #312e81;
      color: white;
      flex: 1;
      padding: 1.25rem;
      border-radius: 16px;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-indigo:hover { background: #1e1b4b; }
    .wishlist-circle {
      width: 65px;
      height: 65px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .wishlist-circle:hover { border-color: #312e81; }

    @media (max-width: 1000px) {
      .concept-product-grid { grid-template-columns: 1fr; padding: 1.5rem; }
      .concept-title { font-size: 2.2rem; }
      .price-main { font-size: 2.5rem; }
    }
  `]
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  loading = true;
  error = '';
  savedIds: number[] = [];

  constructor(
    private route: ActivatedRoute, 
    private listingService: ListingService,
    private wishlistService: WishlistService,
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

    this.wishlistService.savedListingIds$.subscribe(ids => this.savedIds = ids);
  }

  isSaved(): boolean {
    return this.listing ? this.savedIds.includes(this.listing.id!) : false;
  }

  messageSeller() {
    if (!this.authService.getToken()) {
      alert("Please login to message the seller.");
      this.router.navigate(['/login']);
      return;
    }
    
    if (this.listing) {
      const receiverId = this.listing['userId'] || 2; 
      this.router.navigate(['/inbox'], { 
        queryParams: { 
          listingId: this.listing.id, 
          receiverId: receiverId 
        } 
      });
    }
  }

  toggleWishlist() {
    if (!this.authService.getToken()) {
      alert("Please login to save items.");
      this.router.navigate(['/login']);
      return;
    }
    if (this.listing?.id) {
      this.wishlistService.toggleWishlist(this.listing.id).subscribe();
    }
  }
}
