import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  college: string;
  profilePic?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Purchase {
  id: number;
  listingId: number;
  sellerId: number;
  price: number;
  purchaseDate: string;
  listingTitle: string;
  listingImageUrl: string;
  sellerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}/profile`);
  }

  updateProfile(userId: number, data: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/profile`, data);
  }

  getPurchaseHistory(userId: number): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.apiUrl}/${userId}/purchases`);
  }

  buyListing(userId: number, listingId: number, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/purchases`, { listingId, price });
  }

  getUserListings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/listings`);
  }

  submitRating(sellerId: number, listingId: number, rating: number, comment: string): Observable<any> {
    return this.http.post(`/api/ratings`, { sellerId, listingId, rating, comment });
  }
}
