import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="verification-page fade-in">
      <div class="verify-card">
        <div class="verify-header">
          <span class="material-icons verify-icon">mark_email_read</span>
          <h1>Verify your Email</h1>
          <p>We've sent a 6-digit code to <strong>{{email}}</strong></p>
        </div>

        <div class="code-container">
          <input type="text" maxlength="6" [(ngModel)]="code" placeholder="000000" class="code-input">
        </div>

        <div *ngIf="error" class="error-msg">{{error}}</div>
        <div *ngIf="success" class="success-msg">Verification successful! Redirecting...</div>

        <button class="btn btn-primary btn-block mt-4" [disabled]="code.length !== 6 || loading" (click)="verify()">
          {{ loading ? 'Verifying...' : 'Verify & Continue' }}
        </button>

        <p class="resend-text">Didn't receive a code? <a href="javascript:void(0)">Check your server console (mock)</a></p>
      </div>
    </div>
  `,
  styles: [`
    .verification-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 80px);
      background-color: var(--bg-main);
      padding: 2rem;
    }
    .verify-card {
      background: white;
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.05);
      max-width: 450px;
      width: 100%;
      text-align: center;
    }
    .verify-icon {
      font-size: 4rem;
      color: #1d5f8f;
      margin-bottom: 1.5rem;
    }
    h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
    p { color: var(--text-muted); margin-bottom: 2rem; }
    .code-input {
      width: 100%;
      font-size: 2.5rem;
      text-align: center;
      letter-spacing: 1rem;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
    }
    .code-input:focus {
      border-color: #1d5f8f;
      outline: none;
      box-shadow: 0 0 0 4px rgba(29, 95, 143, 0.1);
    }
    .error-msg { color: #ef4444; margin-top: 1rem; font-weight: 600; }
    .success-msg { color: #10b981; margin-top: 1rem; font-weight: 600; }
    .resend-text { margin-top: 2rem; font-size: 0.9rem; }
    .resend-text a { color: #1d5f8f; font-weight: 600; text-decoration: none; }
  `]
})
export class VerificationComponent implements OnInit {
  email = '';
  code = '';
  loading = false;
  error = '';
  success = false;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  verify() {
    this.loading = true;
    this.error = '';
    this.authService.verify(this.email, this.code).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Invalid code. Please try again.';
        this.loading = false;
      }
    });
  }
}

