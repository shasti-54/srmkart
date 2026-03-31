import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingService, Listing, Category } from '../../services/listing.service';
import { WishlistService } from '../../services/wishlist.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="search-page">
      <div class="container search-container fade-in">
        
        <!-- Sidebar Filters -->
        <aside class="sidebar">
          <h3 class="filter-header">Filters</h3>
          <div class="filter-group">
            <label class="form-label">Category</label>
            <select class="form-control" [(ngModel)]="selectedCategory" (change)="onFilterChange()">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</option>
            </select>
          </div>
          <hr class="filter-divider">
          <div class="filter-group">
            <label class="form-label">Price Range</label>
            <div class="price-inputs">
              <input type="number" class="form-control form-control-sm" placeholder="Min">
              <span>-</span>
              <input type="number" class="form-control form-control-sm" placeholder="Max">
            </div>
            <button class="btn btn-outline btn-block mt-2" style="padding: 0.5rem; font-size: 0.85rem;">Apply</button>
          </div>
        </aside>
        
        <!-- Main Search Results -->
        <main class="main-results">
          <div class="results-header-bar">
            <h2 class="results-header">Search Results <span *ngIf="query" class="query-text">for "{{ query }}"</span></h2>
            <div class="results-count" *ngIf="!loading">{{listings.length}} Items Found</div>
          </div>
          
          <div *ngIf="loading" class="loading-state">
             <div class="spinner"></div>
             <p>Loading items...</p>
          </div>
          
          <div *ngIf="!loading && listings.length === 0" class="empty-state">
            <span class="material-icons empty-icon">search_off</span>
            <h3>No results found</h3>
            <p>Try refining your search or removing filters.</p>
            <button class="btn btn-outline mt-2" (click)="clearFilters()">Clear Filters</button>
          </div>

          <div class="product-grid" *ngIf="listings.length > 0">
            <div class="retail-product-card" *ngFor="let listing of listings" [routerLink]="['/listing', listing.id]">
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
        </main>
      </div>
    </div>
  `,
  styles: [`
    .search-page {
      background-color: var(--bg-main);
      min-height: calc(100vh - 80px);
      padding: 2rem 0 5rem;
    }

    .search-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    @media (min-width: 900px) {
      .search-container {
        grid-template-columns: 260px 1fr;
        gap: 3rem;
      }
    }

    /* Sidebar Styling */
    .sidebar {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 100px;
    }

    .filter-header {
      font-size: 1.25rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1.5rem;
    }

    .filter-divider {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 1.5rem 0;
    }

    .form-control-sm {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Results Header */
    .results-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }

    .results-header {
      font-size: 1.75rem;
      font-weight: 700;
    }

    .query-text {
      color: var(--primary-color);
      font-weight: 800;
    }

    .results-count {
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Product Grid */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 2.5rem 1.5rem;
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
      height: 100%;
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
      font-size: 1.15rem;
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
    .loading-state {
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

    .empty-state { 
      text-align: center; 
      padding: 5rem 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }
    .empty-icon {
      font-size: 3rem;
      color: var(--border-color);
      margin-bottom: 1rem;
    }
    .empty-state h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); margin-bottom: 1.5rem; }
  `]
})
export class SearchComponent implements OnInit {
  query = '';
  selectedCategory = '';
  categories: Category[] = [];
  listings: Listing[] = [];
  loading = true;
  savedIds: number[] = [];

  constructor(
    private route: ActivatedRoute, 
    private listingService: ListingService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.listingService.getCategories().subscribe(res => {
      this.categories = res || [];
    });

    this.wishlistService.savedListingIds$.subscribe(ids => this.savedIds = ids);

    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      this.selectedCategory = params['category'] || '';
      this.performSearch();
    });
  }

  isSaved(id: number | undefined): boolean {
    return id ? this.savedIds.includes(id) : false;
  }

  toggleWishlist(id: number | undefined, event: Event) {
    event.stopPropagation();
    if (!id) return;
    this.wishlistService.toggleWishlist(id).subscribe();
  }

  onFilterChange() {
    this.performSearch();
  }
  
  clearFilters() {
    this.query = '';
    this.selectedCategory = '';
    this.performSearch();
  }

  performSearch() {
    this.loading = true;
    this.listingService.searchListings(this.query, this.selectedCategory).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.listings = data;
        } else {
          this.loadMockListings();
        }
        this.loading = false;
      },
      error: () => {
        this.loadMockListings();
        this.loading = false;
      }
    });
  }

  loadMockListings() {
    const allMocks = [
      {
        id: 1,
        title: 'Casio FX-991EX Scientific Calculator',
        description: 'Barely used, perfect condition.',
        price: 500,
        categoryId: 2,
        categoryName: 'CALCULATORS',
        conditionStatus: 'NEW',
        sellerName: 'Priya Sharma',
        imageUrl: 'https://images.unsplash.com/photo-1594951010368-22bd6f120790?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 2,
        title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
        description: 'Great for studying in noisy dorms.',
        price: 8500,
        categoryId: 2,
        categoryName: 'ELECTRONICS',
        conditionStatus: 'Good',
        sellerName: 'Rahul Verma',
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 3,
        title: 'Engineering Mathematics Vol 1. by H.K. Dass',
        description: 'Brand new, uncut pages.',
        price: 300,
        categoryId: 1,
        categoryName: 'BOOKS',
        conditionStatus: 'NEW',
        sellerName: 'Anjali Desai',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 4,
        title: 'Ergonomic Desk Chair with Lumbar Support',
        description: 'Heavy duty study chair, moving out sale.',
        price: 1200,
        categoryId: 5,
        categoryName: 'FURNITURE',
        conditionStatus: 'Fair',
        sellerName: 'Karan Singh',
        imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400'
      }
    ];

    // Simple mock filter
    this.listings = allMocks.filter(m => {
      let match = true;
      if (this.selectedCategory && m.categoryId.toString() !== this.selectedCategory) match = false;
      if (this.query && !m.title.toLowerCase().includes(this.query.toLowerCase())) match = false;
      return match;
    });
  }
}
