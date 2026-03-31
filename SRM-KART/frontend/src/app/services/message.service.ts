import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Message {
  id?: number;
  listingId: number;
  senderId?: number;
  receiverId: number;
  content: string;
  sentAt?: string;
  // Optional mapped fields from backend depending on joins
  senderName?: string;
  listingTitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = '/api/messages';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message, { headers: this.getAuthHeaders() });
  }
}
