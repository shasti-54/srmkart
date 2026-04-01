import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService, User, Purchase } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="profile-page container fade-in mt-5">
      <div class="row">
        <!-- Sidebar -->
        <aside class="col-lg-4 mb-4">
          <div class="profile-sidebar-card">
            <div class="profile-avatar mb-3">
              {{ (user?.name || 'U').charAt(0).toUpperCase() }}
            </div>
            <h2 class="profile-name">{{user?.name}}</h2>
            <div class="profile-badge mb-4">
              <span class="material-icons badge-icon" [style.color]="user?.isVerified ? '#10b981' : '#9ca3af'">
                {{ user?.isVerified ? 'verified' : 'pending' }}
              </span>
              {{ user?.isVerified ? 'Verified Student' : 'Awaiting Verification' }}
            </div>

            <div class="profile-meta">
              <div class="meta-item mt-3">
                <span class="material-icons">school</span>
                <span>{{user?.college}} University</span>
              </div>
              <div class="meta-item">
                <span class="material-icons">event</span>
                <span>Joined {{user?.createdAt | date:'mediumDate'}}</span>
              </div>
            </div>

            <button class="btn btn-outline btn-block mt-5" routerLink="/settings">
              <span class="material-icons btn-icon">settings</span> Edit Profile
            </button>
          </div>
        </aside>

        <!-- Main Content (Tabs) -->
        <main class="col-lg-8">
          <div class="tabs-header mb-4">
            <button class="tab-btn" [class.active]="activeTab === 'listings'" (click)="activeTab = 'listings'">My Listings</button>
            <button class="tab-btn" [class.active]="activeTab === 'purchases'" (click)="activeTab = 'purchases'">Purchase History</button>
          </div>

          <!-- Listings Tab -->
          <div *ngIf="activeTab === 'listings'" class="tab-content">
            <div class="listings-grid">
              <div *ngFor="let item of userListings" class="listing-item" [routerLink]="['/listing', item.id]">
                <div class="item-img-wrapper">
                  <img [src]="item.imageUrl || 'assets/placeholder-item.png'" alt="item" class="item-img">
                </div>
                <div class="item-info">
                  <h4 class="item-title">{{item.title}}</h4>
                  <p class="item-price">₹{{item.price}}</p>
                </div>
              </div>
            </div>
            <div *ngIf="userListings.length === 0" class="empty-tab">
              <span class="material-icons empty-icon">sell</span>
              <h3>You haven't listed anything yet</h3>
              <button class="btn btn-primary mt-3" routerLink="/sell">Post an Item</button>
            </div>
          </div>

          <!-- Purchase History Tab -->
          <div *ngIf="activeTab === 'purchases'" class="tab-content">
            <div class="purchase-list">
              <div *ngFor="let p of purchases" class="purchase-item card mt-2 mb-3">
                <div class="card-body purchase-card-body">
                   <div class="purchase-info-group">
                      <div class="purchase-img-box">
                         <img [src]="p.listingImageUrl || 'assets/placeholder-item.png'" alt="item">
                      </div>
                      <div class="purchase-details">
                         <h4 class="purchase-title">{{p.listingTitle}}</h4>
                         <p class="purchase-seller">Sold by <strong>{{p.sellerName}}</strong></p>
                         <p class="purchase-date text-muted">{{p.purchaseDate | date:'medium'}}</p>
                      </div>
                   </div>
                   <div class="purchase-actions mt-3" *ngIf="activeTab === 'purchases'">
                       <button class="btn btn-sm btn-primary" (click)="openRatingModal(p)">Rate Seller</button>
                   </div>
                   <div class="purchase-price">
                       ₹{{p.price}}
                   </div>
                </div>
              </div>
            </div>

            <!-- Rating Modal -->
            <div class="modal-backdrop fade-in" *ngIf="isRatingModalOpen" (click)="closeRatingModal()">
               <div class="rating-modal card" (click)="$event.stopPropagation()">
                  <div class="modal-header">
                     <h3>Rate your experience</h3>
                     <button class="close-btn" (click)="closeRatingModal()">&times;</button>
                  </div>
                  <div class="modal-body text-center">
                     <p>How was your trade for <strong>{{selectedPurchase?.listingTitle}}</strong>?</p>
                     <div class="star-rating mb-4">
                        <span class="material-icons star" 
                              *ngFor="let s of [1,2,3,4,5]" 
                              [class.filled]="s <= currentRating"
                              (click)="currentRating = s">
                           {{ s <= currentRating ? 'star' : 'star_outline' }}
                        </span>
                     </div>
                     <textarea class="form-control mb-3" [(ngModel)]="ratingComment" placeholder="Write a short review... (optional)"></textarea>
                     <button class="btn btn-primary btn-block" [disabled]="currentRating === 0" (click)="submitRating()">Submit Review</button>
                  </div>
               </div>
            </div>

            <div *ngIf="purchases.length === 0" class="empty-tab">
              <span class="material-icons empty-icon">shopping_bag</span>
              <h3>No purchases recorded yet</h3>
              <button class="btn btn-outline mt-3" routerLink="/search">Explore Marketplace</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding-bottom: 5rem; }
    .profile-sidebar-card {
      background: white; border: 1px solid var(--border-color);
      border-radius: 20px; padding: 2.5rem; text-align: center;
      position: sticky; top: 100px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    }
    .profile-avatar {
      width: 120px; height: 120px; background: linear-gradient(135deg, #1d5f8f, #312e81);
      color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 3.5rem; font-weight: 800; font-family: 'Outfit', sans-serif; margin: 0 auto;
    }
    .profile-name { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; }
    .profile-badge { font-weight: 600; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 6px; }
    .badge-icon { font-size: 1.25rem; }
    .meta-item { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); margin-bottom: 0.5rem; }
    .meta-item .material-icons { font-size: 1.1rem; }

    .tabs-header { border-bottom: 2px solid var(--border-color); display: flex; gap: 2rem; }
    .tab-btn { border: none; background: none; font-size: 1.15rem; font-weight: 700; color: var(--text-muted); padding: 1rem 0; cursor: pointer; position: relative; }
    .tab-btn.active { color: #1d5f8f; }
    .tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: #1d5f8f; }

    .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
    .listing-item { border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; cursor: pointer; background: white; transition: transform 0.2s; }
    .listing-item:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .item-img-wrapper { height: 180px; background: #f8f9fc; display: flex; align-items: center; justify-content: center; }
    .item-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .item-info { padding: 1rem; }
    .item-title { font-weight: 700; margin-bottom: 0.25rem; font-size: 1rem; }
    .item-price { font-weight: 800; color: #1d5f8f; margin: 0; }

    .purchase-card-body { display: flex; align-items: center; justify-content: space-between; }
    .purchase-info-group { display: flex; align-items: center; gap: 1.5rem; }
    .purchase-img-box { width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: #f8f9fc; }
    .purchase-img-box img { width: 100%; height: 100%; object-fit: cover; }
    .purchase-title { margin: 0; font-weight: 700; font-size: 1.1rem; }
    .purchase-seller { margin: 2px 0; font-size: 0.9rem; }
    .purchase-date { font-size: 0.8rem; margin: 0; }
    .purchase-price { font-size: 1.5rem; font-weight: 900; color: #1d5f8f; }

    /* Rating Modal */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .rating-modal { width: 400px; padding: 2rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .star-rating { display: flex; justify-content: center; gap: 8px; }
    .star { font-size: 2.5rem; color: #ddd; cursor: pointer; transition: color 0.2s; }
    .star.filled { color: #fbbf24; }
    .empty-tab { text-align: center; padding: 5rem 0; color: var(--text-muted); }
    .empty-icon { font-size: 4rem; color: var(--border-color); margin-bottom: 1.5rem; }
    .btn-icon { font-size: 1rem; vertical-align: middle; margin-right: 4px; }
  `]
})
export class ProfileComponent implements OnInit {
  user?: User;
  userListings: any[] = [];
  purchases: Purchase[] = [];
  activeTab: 'listings' | 'purchases' = 'listings';
  
  isRatingModalOpen = false;
  selectedPurchase: Purchase | null = null;
  currentRating = 0;
  ratingComment = '';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    const userId = this.authService.getCurrentUserId();
    this.userService.getProfile(userId).subscribe(u => this.user = u);
    this.userService.getUserListings(userId).subscribe(l => this.userListings = l);
    this.userService.getPurchaseHistory(userId).subscribe(p => this.purchases = p);
  }

  openRatingModal(p: Purchase) {
    this.selectedPurchase = p;
    this.isRatingModalOpen = true;
    this.currentRating = 0;
    this.ratingComment = '';
  }

  closeRatingModal() {
    this.isRatingModalOpen = false;
  }

  submitRating() {
    if (!this.selectedPurchase || this.currentRating === 0) return;
    
    this.userService.submitRating(
      this.selectedPurchase.sellerId,
      this.selectedPurchase.listingId,
      this.currentRating,
      this.ratingComment
    ).subscribe({
      next: () => {
        alert('Thank you for your feedback!');
        this.closeRatingModal();
      },
      error: (err) => {
        if (err.status === 500) alert('You have already rated this item.');
        else alert('Failed to submit rating.');
      }
    });
  }
}
