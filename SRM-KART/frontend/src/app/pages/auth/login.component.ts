import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper fade-in">
      
      <div class="auth-card card">
        <div class="auth-header">
          <h2>Sign In</h2>
          <p>Welcome back to SRMKart</p>
        </div>

        <div *ngIf="error" class="alert alert-danger">
          <span class="material-icons alert-icon">error_outline</span>
          {{error}}
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
          <div class="form-group">
            <label class="form-label">College Email</label>
            <input type="email" class="form-control" name="email" [(ngModel)]="credentials.email" required placeholder="name.ab1234@srmist.edu.in">
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" name="password" [(ngModel)]="credentials.password" required placeholder="Enter your password">
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="!loginForm.form.valid || loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading" class="material-icons rotating">autorenew</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>New to SRMKart? <a routerLink="/register" class="register-link">Create an account</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 80px); /* Adjust based on navbar height */
      padding: 3rem 1rem;
      background-color: var(--bg-main);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 3rem 2.5rem;
      /* Using globals: background-color: var(--bg-card); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); */
    }
    
    .auth-header {
      margin-bottom: 2.5rem;
    }
    
    .auth-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
      color: var(--text-main);
    }
    
    .auth-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
        
    .btn-block {
      width: 100%;
      margin-top: 2rem;
      padding: 1rem;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .auth-footer {
      margin-top: 2.5rem;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .auth-footer p {
      color: var(--text-darker);
      font-size: 0.9rem;
    }
    
    .register-link {
      font-weight: 600;
      color: var(--primary-color);
      text-decoration: underline;
      margin-left: 0.25rem;
    }
    .register-link:hover {
      color: var(--primary-hover);
    }
    
    .alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    
    .alert-danger {
      background-color: #fee2e2;
      color: var(--danger);
      border: 1px solid #f87171;
    }
    
    .alert-icon { font-size: 20px; }
    .rotating { animation: spin 1s linear infinite; }
    
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
      }
    });
  }
}
