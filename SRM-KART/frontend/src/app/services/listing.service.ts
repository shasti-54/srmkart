import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Listing {
  id?: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  conditionStatus: string;
  sellerName?: string;
  categoryName?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = 'http://localhost:8080/srmkart/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getAllListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/listings`);
  }

  searchListings(query: string, categoryId: string = ''): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/search?q=${query}&category=${categoryId}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getListingById(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/listings/${id}`);
  }

  createListing(listing: Listing): Observable<Listing> {
    return this.http.post<Listing>(`${this.apiUrl}/listings`, listing, { headers: this.getAuthHeaders() });
  }

  createListingWithImage(formData: FormData): Observable<Listing> {
    return this.http.post<Listing>(`${this.apiUrl}/listings`, formData, { headers: this.getAuthHeaders() });
  }
  
  getPlatformStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
