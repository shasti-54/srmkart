import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingService, Listing, Category } from '../../services/listing.service';
import { WishlistService } from '../../services/wishlist.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page fade-in">
      <!-- Ajio/Retail Style Hero Banner -->
      <section class="hero-section">
        <div class="container hero-content">
          <div class="hero-text-content">
            <span class="badge-tag">Your campus. Your marketplace.</span>
            <h1 class="hero-title">Buy & Sell<br>smarter on<br>campus.</h1>
            <p class="hero-subtitle">From textbooks to lab gear — find it cheaper from a fellow student. Post a listing in under 2 minutes.</p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-cta" routerLink="/search">Shop Collection</button>
              <button class="btn btn-outline btn-cta ml-3" routerLink="/sell">Post an Item</button>
            </div>
          </div>
          <div class="hero-image-placeholder">
            <div class="fashion-box fashion-box-1"></div>
            <div class="fashion-box fashion-box-2"></div>
          </div>
        </div>
      </section>

      <!-- Campus Stats Banner (Custom Request) -->
      <section class="stats-banner">
        <div class="container stats-grid">
          <div class="stat-item mt-4">
            <span class="stat-number">{{stats.activeListings}}</span>
            <span class="stat-label">Active listings</span>
          </div>
          <div class="stat-item mt-4">
            <span class="stat-number">{{stats.registeredStudents}}</span>
            <span class="stat-label">Students<br>registered</span>
          </div>
          <div class="stat-item mt-4 mb-4">
            <span class="stat-number">{{stats.tradedOnCampus}}</span>
            <span class="stat-label">Traded on<br>campus</span>
          </div>
          <div class="stat-item mt-4 mb-4">
            <span class="stat-number">{{stats.avgSellerRating}} <span class="material-icons star-icon">star</span></span>
            <span class="stat-label">Avg seller<br>rating</span>
          </div>
        </div>
      </section>

      <!-- Shop by Category (Retail Grid) -->
      <section class="category-section container mt-3">
        <h2 class="section-title text-center">Explore Categories</h2>
        <div class="separator-line"></div>
        
        <div class="category-grid">
          <div class="cat-retail-card" *ngFor="let cat of categories.slice(0, 6)" [routerLink]="['/search']" [queryParams]="{category: cat.id}">
            <div class="cat-retail-icon">
              <span class="material-icons">{{cat.icon}}</span>
            </div>
            <h3 class="cat-retail-name">{{cat.name}}</h3>
          </div>
        </div>
      </section>

      <!-- Product Grid Showcase -->
      <section class="recent-listings-section container">
        <div class="section-header">
          <h2 class="section-title">Student Steals</h2>
          <a routerLink="/search" class="view-all-link">View All Products &rarr;</a>
        </div>
        
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Curating the latest arrivals...</p>
        </div>

        <div *ngIf="!loading && listings.length === 0" class="empty-state">
          <span class="material-icons empty-icon">shopping_bag</span>
          <h3>No fresh arrivals yet</h3>
          <p>Be the first to drop a listing in the marketplace!</p>
          <button class="btn btn-primary mt-2" routerLink="/sell">Sell Now</button>
        </div>
        
        <div class="product-grid" *ngIf="listings.length > 0">
          <div class="retail-product-card" *ngFor="let listing of listings; let i = index" [routerLink]="['/listing', listing.id]">
            <div class="product-img-wrapper">
              <span class="badge-deal" *ngIf="listing.conditionStatus === 'NEW'">DEAL</span>
              <button class="wishlist-btn" (click)="toggleWishlist(listing.id, $event)">
                <span class="material-icons wishlist-icon" [style.color]="isSaved(listing.id) ? '#ef4444' : '#374151'">
                  {{ isSaved(listing.id) ? 'favorite' : 'favorite_border' }}
                </span>
              </button>
              <img [src]="listing.imageUrl || 'assets/placeholder-item.png'" alt="{{listing.title}}" class="product-img" onerror="this.src='https://placehold.co/400x400/fdf3c6/312e81?text=No+Preview'">
            </div>
            
            <div class="product-card-body">
              <div class="product-category-text">{{listing.categoryName || 'ESSENTIALS'}}</div>
              <h3 class="product-name">{{listing.title}}</h3>
              
              <div class="product-footer-row">
                <div class="price-group">
                  <span class="price-current">₹{{listing.price}}</span>
                  <span class="price-old" *ngIf="listing.price > 100">₹{{listing.price + 400}}</span>
                </div>
                
                <div class="seller-mini-info">
                  <div class="seller-avatar">{{ (listing.sellerName || 'S').charAt(0).toUpperCase() }}</div>
                  <span class="seller-name">{{ (listing.sellerName || 'Student').split(' ')[0] }} · 2nd yr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      background-color: var(--bg-main);
      padding-bottom: 4rem;
    }
    
    /* Hero Banner (Ajio style: clean split layout, stark typography) */
    .hero-section {
      background-color: #f1f3f5;
      padding: 5rem 0;
      border-bottom: 1px solid var(--border-color);
      overflow: hidden;
    }
    
    .hero-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 3rem;
    }
    
    .hero-text-content {
      flex: 1;
      max-width: 600px;
    }
    
    .badge-tag {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--text-darker);
      margin-bottom: 2rem;
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 4px;
    }
    
    .hero-title {
      font-size: 4.5rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.05;
      margin-bottom: 1.5rem;
      letter-spacing: -1.5px;
      text-transform: uppercase;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-muted);
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }
    
    .hero-actions {
      display: flex;
      gap: 1.5rem;
    }
    
    .btn-cta {
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Abstract Fashion Box placeholder for right side of hero */
    .hero-image-placeholder {
      flex: 1;
      display: flex;
      justify-content: center;
      position: relative;
      height: 400px;
    }

    .fashion-box {
      width: 250px;
      height: 350px;
      background: var(--border-color);
      position: absolute;
    }

    .fashion-box-1 {
      background: #e2e8f0;
      z-index: 2;
      transform: rotate(-5deg);
      box-shadow: var(--shadow-lg);
    }

    .fashion-box-2 {
      background: #cbd5e1;
      z-index: 1;
      transform: rotate(10deg) translate(40px, 20px);
    }

    /* Campus Stats Banner */
    .stats-banner {
      background-color: #f7cb45; /* Golden Yellow */
      padding: 3.5rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      row-gap: 4rem;
      column-gap: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .stat-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .stat-number {
      font-family: 'Outfit', sans-serif;
      font-size: 3rem;
      font-weight: 900;
      color: #25176b; /* Deep Indigo */
      letter-spacing: -1px;
      line-height: 1;
      display: flex;
      align-items: center;
    }

    .stat-label {
      font-family: 'Inter', sans-serif;
      font-size: 1.15rem;
      color: #5b4b8a; /* Muted Indigo */
      font-weight: 400;
      text-align: left;
      line-height: 1.25;
    }

    .star-icon {
      font-size: 2.2rem;
      margin-left: 5px;
      color: #25176b;
    }

    /* Category Section */
    .category-section {
      padding: 5rem 0;
      background-color: var(--bg-card);
      margin-top: 0;
      max-width: 100%;
    }

    .section-title {
      font-size: 2.5rem;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      margin-bottom: 1rem;
    }

    .separator-line {
      width: 60px;
      height: 3px;
      background-color: var(--primary-color);
      margin: 0 auto 3rem;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .cat-retail-card {
      background: #f8f9fc;
      border: 1px solid var(--border-color);
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cat-retail-card:hover {
      background: #ffffff;
      box-shadow: var(--shadow-md);
      transform: translateY(-3px);
      border-color: var(--primary-color);
    }

    .cat-retail-icon .material-icons {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;
    }

    .cat-retail-card:hover .cat-retail-icon .material-icons {
      transform: scale(1.1);
    }

    .cat-retail-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Product Grid Showcase */
    .recent-listings-section {
      padding-top: 5rem;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }
    
    .view-all-link {
      font-weight: 600;
      color: var(--primary-color);
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }
    .view-all-link:hover { text-decoration: underline; }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 2rem;
    }
    
    /* Premium Requested Retail Card */
    .retail-product-card {
      border: 1px solid #f3f4f6;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      overflow: hidden;
      transition: box-shadow 0.25s ease, transform 0.25s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }
    
    .retail-product-card:hover {
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      transform: translateY(-4px);
    }

    .product-img-wrapper {
      position: relative;
      background: #fdf3c6; /* Soft golden yellow */
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 2rem;
    }
    
    .badge-deal {
      position: absolute;
      top: 15px; left: 15px;
      background: #fbbf24;
      color: #1f2937;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      z-index: 10;
    }
    
    .wishlist-btn {
      position: absolute;
      top: 15px; right: 15px;
      background: #ffffff;
      border: none;
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      z-index: 10;
      color: #374151;
      transition: transform 0.2s;
    }
    .wishlist-btn:hover { transform: scale(1.1); color: #ef4444; }
    .wishlist-icon { font-size: 1.2rem; }

    .product-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.4s ease;
    }
    .retail-product-card:hover .product-img {
      transform: scale(1.08); 
    }

    .product-card-body {
      padding: 1.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .product-category-text {
      color: #312e81; /* Deep indigo */
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
      font-family: var(--font-body);
    }

    .product-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      color: #111827;
      font-weight: 700;
      margin-bottom: 1.5rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    
    .product-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      gap: 0.5rem;
    }

    .price-group {
      display: flex;
      align-items: baseline;
      gap: 6px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .price-current {
      font-family: 'Outfit', sans-serif;
      font-size: 1.6rem;
      font-weight: 900;
      color: #312e81; /* Indigo */
      line-height: 1;
      letter-spacing: -1px;
    }

    .price-old {
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
      color: #9ca3af;
      text-decoration: line-through;
      font-weight: 500;
      white-space: nowrap;
    }

    .seller-mini-info {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex-shrink: 1;
    }
    
    .seller-avatar {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: #ff7b5a; /* Orange */
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      flex-shrink: 0;
    }
    
    .seller-name {
      font-size: 0.85rem;
      color: #6b7280;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* States */
    .loading-state, .empty-state {
      text-align: center;
      padding: 5rem 0;
      color: var(--text-muted);
    }
    
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }

    @media (max-width: 768px) {
      .hero-content { flex-direction: column; text-align: center; }
      .hero-title { font-size: 3rem; }
      .hero-image-placeholder { display: none; }
      .hero-actions { justify-content: center; }
    }
  `]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [
    { id: 1, name: 'Books', icon: 'menu_book' },
    { id: 2, name: 'Electronics', icon: 'laptop_mac' },
    { id: 3, name: 'Stationery', icon: 'edit' },
    { id: 4, name: 'Lab Tools', icon: 'biotech' },
    { id: 5, name: 'Furniture', icon: 'chair' },
    { id: 6, name: 'Others', icon: 'category' }
  ];
  listings: Listing[] = [];
  loading = true;
  
  stats = {
    activeListings: '...',
    registeredStudents: '...',
    tradedOnCampus: '...',
    avgSellerRating: '...'
  };
  
  savedIds: number[] = [];

  constructor(
    private listingService: ListingService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.fetchCategories();
    this.fetchListings();
    this.fetchStats();
    this.wishlistService.savedListingIds$.subscribe(ids => this.savedIds = ids);
  }

  isSaved(id: number | undefined): boolean {
    return id ? this.savedIds.includes(id) : false;
  }

  toggleWishlist(id: number | undefined, event: Event) {
    event.stopPropagation(); // prevent navigation to detail page
    if (!id) return;
    this.wishlistService.toggleWishlist(id).subscribe();
  }

  fetchStats() {
    this.listingService.getPlatformStats().subscribe({
      next: (data) => {
        if (data) this.stats = data;
      },
      error: (err) => console.error('Error fetching stats:', err)
    });
  }

  fetchCategories() {
    this.listingService.getCategories().subscribe({
      next: (data) => {
        if(data && data.length > 0) this.categories = data;
      },
      error: () => {}
    });
  }

  fetchListings() {
    this.listingService.getAllListings().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.listings = data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch from DB:', err);
        this.loading = false;
      }
    });
  }
}
