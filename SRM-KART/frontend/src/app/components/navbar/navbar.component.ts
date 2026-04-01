import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <header class="retail-header">
      <!-- Promotional Top Announcement Bar -->
      <div class="announcement-bar">
        <div class="nav-container top-bar-content">
          <span><span class="material-icons sm-icon">local_shipping</span> Fast On-Campus Exchange</span>
          <span class="tagline">Welcome to SRMKart — The Official Marketplace Built Exclusively for SRM Students</span>
          <span><span class="material-icons sm-icon">verified_user</span> 100% Verified Students</span>
        </div>
      </div>

      <!-- Main Navbar -->
      <nav class="retail-navbar">
        <div class="nav-container main-nav-content">
          <!-- Logo -->
          <a routerLink="/" class="logo">
            <span class="logo-text">SRM<span class="logo-bold">KART</span></span>
          </a>

          <!-- Search Bar (Centered) -->
          <div class="nav-search-wrapper">
            <div class="retail-search">
              <input type="text" placeholder="Search for electronics, books, lab tools..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
              <button class="search-btn" (click)="onSearch()">
                <span class="material-icons">search</span>
              </button>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="nav-actions">
            <ng-container *ngIf="!(authService.isLoggedIn$ | async); else loggedInTpl">
              <a routerLink="/login" class="action-item">
                <span class="material-icons action-icon">account_circle</span>
                <div class="action-text-group">
                  <span class="action-text-small">Hello, Sign in</span>
                  <span class="action-text-main">Account & Info</span>
                </div>
              </a>
            </ng-container>

            <ng-template #loggedInTpl>
              <a routerLink="/profile" class="action-item" title="My Profile">
                <span class="material-icons action-icon">account_circle</span>
                <div class="action-text-group">
                  <span class="action-text-small">Welcome back</span>
                  <span class="action-text-main">My Profile</span>
                </div>
              </a>
              
              <a routerLink="/settings" class="action-item" title="Settings">
                <span class="material-icons action-icon">settings</span>
              </a>
              
              <button (click)="logout()" class="action-item btn-link" title="Logout">
                <span class="material-icons action-icon text-muted">logout</span>
              </button>
            </ng-template>
            
            <a routerLink="/inbox" class="action-item" title="Messages">
              <div class="cart-icon-wrapper">
                <span class="material-icons action-icon">chat</span>
              </div>
              <div class="action-text-group">
                <span class="action-text-main">Messages</span>
              </div>
            </a>
            
            <a routerLink="/dashboard" class="action-item cart-action" title="Saved Items">
              <div class="cart-icon-wrapper">
                <span class="material-icons cart-icon" [style.color]="savedCount > 0 ? '#ef4444' : '#cbd5e1'">favorite</span>
                <span class="cart-badge" *ngIf="savedCount > 0">{{savedCount}}</span>
              </div>
              <span class="action-text-main cart-text">Saved</span>
            </a>
          </div>
        </div>

        <!-- Secondary Categories Bar -->
        <div class="categories-bar">
          <div class="nav-container categories-content">
            <a routerLink="/search" class="nav-category-link"><span class="material-icons menu-icon">menu</span> Shop All</a>
            <a routerLink="/search" [queryParams]="{category: '2'}" class="nav-category-link">Electronics</a>
            <a routerLink="/search" [queryParams]="{category: '1'}" class="nav-category-link">Books & Study Material</a>
            <a routerLink="/search" [queryParams]="{category: '4'}" class="nav-category-link">Lab Equipments</a>
            <a routerLink="/search" [queryParams]="{category: '5'}" class="nav-category-link">Dorm Furniture</a>
            <a routerLink="/search" [queryParams]="{category: '3'}" class="nav-category-link">Stationery</a>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .retail-header {
      font-family: var(--font-body);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Announcement Top Bar */
    .announcement-bar {
      background-color: #000000;
      color: #f3f4f6;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.5rem 0;
      letter-spacing: 0.5px;
    }
    .top-bar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tagline {
      color: #fbbf24;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .sm-icon {
      font-size: 1rem;
      vertical-align: middle;
      margin-right: 4px;
      color: #9ca3af;
    }

    /* Main Navbar */
    .retail-navbar {
      background-color: #0f172a; /* Premium Dark Slate */
      color: #ffffff;
    }
    
    .main-nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      gap: 2rem;
    }
    
    /* Logo */
    .logo {
      text-decoration: none;
      color: #ffffff;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .logo-text {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      letter-spacing: -1px;
      font-weight: 300;
    }
    .logo-bold { font-weight: 900; color: #fbbf24; /* Amazon-style orange/gold pop */ }
    
    /* Search Bar */
    .nav-search-wrapper {
      flex: 1;
      max-width: 700px;
    }
    .retail-search {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: var(--radius-sm);
      height: 44px;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      overflow: hidden;
    }
    .retail-search:focus-within {
      border-color: #fbbf24;
      box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
    }
    .retail-search input {
      border: none;
      outline: none;
      background: transparent;
      width: 100%;
      height: 100%;
      padding: 0 1rem;
      font-size: 1rem;
      color: var(--text-main);
    }
    .retail-search input::placeholder { color: #6b7280; }
    
    .search-btn {
      background: #fbbf24;
      color: #000000;
      border: none;
      height: 100%;
      padding: 0 1.25rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    .search-btn:hover { background: #f59e0b; }
    .search-btn .material-icons { font-size: 1.5rem; font-weight: 700; }

    /* Nav Actions */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-shrink: 0;
    }
    
    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffffff;
      text-decoration: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid transparent;
      transition: border 0.2s;
    }
    .action-item:hover { border-color: rgba(255,255,255,0.4); }
    
    .action-icon { font-size: 2rem; color: #cbd5e1; }
    .text-muted { color: #94a3b8; }
    
    .action-text-group {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .action-text-small { font-size: 0.75rem; color: #cbd5e1; }
    .action-text-main { font-size: 0.95rem; font-weight: 700; }
    .btn-link { background: none; }

    /* Cart Action */
    .cart-action {
      position: relative;
      display: flex;
      align-items: flex-end;
    }
    .cart-icon-wrapper { position: relative; display: flex; align-items: center; }
    .cart-icon { font-size: 2.2rem; color: #cbd5e1; }
    .cart-badge {
      position: absolute;
      top: -5px; right: -5px;
      background: #ef4444;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 50px;
    }
    .cart-text { padding-bottom: 2px; }

    /* Categories Bar */
    .categories-bar {
      background-color: #1e293b;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .categories-content {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-top: 5px;
      padding-bottom: 5px;
    }
    .categories-content::-webkit-scrollbar { display: none; }
    
    .nav-category-link {
      color: #cbd5e1;
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      border-radius: 4px;
      border: 1px solid transparent;
      display: flex; align-items: center; gap: 5px;
    }
    .nav-category-link:hover {
      border-color: rgba(255,255,255,0.3);
      color: #ffffff;
    }
    .menu-icon { font-size: 1.2rem; }

    @media (max-width: 1024px) {
      .announcement-bar { display: none; }
      .action-text-group { display: none; }
      .cart-text { display: none; }
      .action-icon { font-size: 1.8rem; }
    }
    @media (max-width: 768px) {
      .main-nav-content { flex-wrap: wrap; gap: 1rem; }
      .nav-search-wrapper { order: 3; width: 100%; max-width: 100%; }
      .categories-bar { display: none; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  searchQuery = '';
  savedCount = 0;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.wishlistService.savedListingIds$.subscribe(ids => {
      this.savedCount = ids.length;
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
