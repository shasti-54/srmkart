import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = '/api/wishlist';
  
  private savedListingIds = new BehaviorSubject<number[]>([]);
  public savedListingIds$ = this.savedListingIds.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    if (this.authService.getToken()) {
      this.loadSavedIds();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  loadSavedIds() {
    this.http.get<number[]>(this.apiUrl, { headers: this.getAuthHeaders() }).subscribe({
      next: (ids) => {
        if (ids) this.savedListingIds.next(ids);
      },
      error: (err) => console.error("Failed to load wishlist", err)
    });
  }

  toggleWishlist(listingId: number): Observable<any> {
    return this.http.post(this.apiUrl, { listingId }, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        let currentIds = this.savedListingIds.value;
        if (currentIds.includes(listingId)) {
          this.savedListingIds.next(currentIds.filter(id => id !== listingId));
        } else {
          this.savedListingIds.next([...currentIds, listingId]);
        }
      })
    );
  }

  getWishlistDetails(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/users/${userId}/wishlist`, { headers: this.getAuthHeaders() });
  }
}
