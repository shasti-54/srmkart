import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingService, Listing } from '../../services/listing.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container dashboard-container">
      <div class="sidebar">
        <ul class="nav-links card">
          <li [class.active]="activeTab === 'listings'" (click)="activeTab = 'listings'">
            <span class="material-icons">inventory_2</span> My Active Listings
          </li>
          <li [class.active]="activeTab === 'wishlist'" (click)="activeTab = 'wishlist'">
            <span class="material-icons">favorite</span> Saved Items
          </li>
          <li><span class="material-icons">shopping_bag</span> Purchase History</li>
          <li><span class="material-icons">settings</span> Account Settings</li>
        </ul>
      </div>

      <div class="main-content">
        <div class="card p-4">
          <h2 class="dashboard-title">{{ activeTab === 'listings' ? 'My Active Listings' : 'Saved Items' }}</h2>
          <p class="text-muted mt-2 mb-4">
            {{ activeTab === 'listings' ? 'Manage all the items you are currently selling on campus.' : 'Items you have favorited for later.' }}
          </p>

          <ng-container *ngIf="activeTab === 'listings'">
            <div *ngIf="myListings.length === 0" class="empty-state mt-4">
              <span class="material-icons empty-icon">assignment</span>
              <p>You haven't posted any listings yet.</p>
              <button class="btn btn-primary mt-3" routerLink="/sell">Post an Ad</button>
            </div>
            
            <div class="retail-grid" *ngIf="myListings.length > 0">
              <div class="retail-product-card" *ngFor="let listing of myListings" [routerLink]="['/listing', listing.id]">
                <div class="product-img-wrapper">
                  <img [src]="listing.imageUrl || 'assets/placeholder-item.png'" class="product-img" onerror="this.src='https://placehold.co/400x400/fdf3c6/312e81?text=No+Preview'">
                </div>
                <div class="product-card-body">
                  <h3 class="product-title">{{listing.title}}</h3>
                  <div class="product-footer-row">
                    <div class="price-group">
                      <span class="price-current">₹{{listing.price}}</span>
                    </div>
                    <div class="seller-mini-info">
                      <span class="seller-name text-success" style="font-weight: 700;">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="activeTab === 'wishlist'">
            <div *ngIf="savedListings.length === 0" class="empty-state mt-4">
              <span class="material-icons empty-icon">favorite_border</span>
              <p>You haven't saved any items yet.</p>
              <button class="btn btn-primary mt-3" routerLink="/search">Browse Marketplace</button>
            </div>

            <div class="retail-grid" *ngIf="savedListings.length > 0">
              <div class="retail-product-card" *ngFor="let listing of savedListings" [routerLink]="['/listing', listing.id]">
                <div class="product-img-wrapper">
                  <img [src]="listing.imageUrl || 'assets/placeholder-item.png'" class="product-img" onerror="this.src='https://placehold.co/400x400/fdf3c6/312e81?text=No+Preview'">
                </div>
                <div class="product-card-body">
                  <h3 class="product-title">{{listing.title}}</h3>
                  <div class="product-footer-row">
                    <div class="price-group">
                      <span class="price-current">₹{{listing.price}}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" (click)="toggleWishlist(listing.id, $event)">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 3rem 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    @media (min-width: 900px) {
      .dashboard-container { grid-template-columns: 280px 1fr; }
    }
    
    .dashboard-title {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .p-4 { padding: 2rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mb-4 { margin-bottom: 2rem; }
    .mt-3 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .text-muted { color: #64748b; font-size: 1.05rem; }
    .text-success { color: #10b981; }
    
    .nav-links {
      list-style: none;
      padding: 1rem 0;
      margin: 0;
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .nav-links li {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      color: #475569;
      font-weight: 600;
      transition: all 0.2s;
      border-left: 4px solid transparent;
    }
    .nav-links li:hover {
      background-color: #f8fafc;
      color: #0f172a;
    }
    .nav-links li.active {
      border-left: 4px solid #312e81; /* Indigo */
      color: #312e81;
      background-color: #f1f5f9;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      background: #f8fafc;
      border-radius: var(--radius-md);
      border: 1px dashed #cbd5e1;
    }
    .empty-icon {
      font-size: 3.5rem;
      color: #94a3b8;
      margin-bottom: 1rem;
    }

    /* Minimal Retail Grid for Dashboard */
    .retail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
    }
    
    .retail-product-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .retail-product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.06);
    }
    .product-img-wrapper {
      width: 100%;
      height: 180px;
      overflow: hidden;
      background: #f8f9fc;
      display: flex; align-items: center; justify-content: center;
    }
    .product-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .product-card-body { padding: 1rem; display: flex; flex-direction: column; }
    .product-title {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .product-footer-row {
      display: flex; align-items: center; justify-content: space-between; margin-top: auto;
    }
    .price-current {
      font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800; color: #312e81;
    }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
    .btn-outline-danger { border: 1px solid #ef4444; color: #ef4444; background: transparent; border-radius: 4px; font-weight: 600; cursor: pointer; }
    .btn-outline-danger:hover { background: #fee2e2; }
  `]
})
export class DashboardComponent implements OnInit {
  activeTab = 'listings';
  myListings: Listing[] = [];
  savedListings: Listing[] = [];

  constructor(
    private listingService: ListingService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userId = this.authService.getCurrentUserId();
    
    // Fetch my listings
    this.listingService.getUserListings(userId).subscribe(res => {
      this.myListings = res || [];
    });

    // Fetch wishlist details
    this.wishlistService.getWishlistDetails(userId).subscribe(res => {
      this.savedListings = res || [];
    });

    // Subscribe to ID changes to keep UI in sync if an item is removed
    this.wishlistService.savedListingIds$.subscribe(ids => {
      this.savedListings = this.savedListings.filter(l => ids.includes(l.id!));
    });
  }

  toggleWishlist(listingId: number, event: Event) {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(listingId).subscribe();
  }
}
