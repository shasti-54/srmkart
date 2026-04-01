import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <span class="material-icons auth-icon">person_add</span>
          <h2>Create Account</h2>
          <p>Join the student marketplace</p>
        </div>

        <div *ngIf="error" class="alert alert-danger">
          {{error}}
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" name="name" [(ngModel)]="user.name" required placeholder="John Doe">
          </div>

          <div class="form-group">
            <label class="form-label">College Email (.edu domain required)</label>
            <input type="email" class="form-control" name="email" [(ngModel)]="user.email" required 
                   pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu(\.in)?$" 
                   #emailInput="ngModel" placeholder="eg. ab1234@srmist.edu.in">
             <small class="text-danger" *ngIf="emailInput.invalid && emailInput.touched">Must be a valid .edu or .edu.in email.</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">College Name</label>
            <input type="text" class="form-control" name="college" [(ngModel)]="user.college" required placeholder="eg. SRM Institute of Science and Technology">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" name="password" [(ngModel)]="user.password" required minlength="6" placeholder="Create a strong password">
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="!registerForm.form.valid || loading">
            <span *ngIf="!loading">Sign Up</span>
            <span *ngIf="loading" class="material-icons rotating">autorenew</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 100px);
      padding: 2rem 1rem;
      background-color: var(--bg-color);
    }
    .auth-card {
      width: 100%;
      max-width: 450px;
      padding: 2.5rem 2rem;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-icon {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    .auth-header h2 {
      font-size: 1.8rem;
    }
    .auth-header p {
      color: var(--text-muted);
    }
    .text-danger {
      color: var(--danger);
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: block;
    }
    .btn-block {
      width: 100%;
      margin-top: 1rem;
      padding: 0.8rem;
      font-size: 1.1rem;
    }
    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .alert-danger {
      background-color: rgba(220, 53, 69, 0.1);
      color: var(--danger);
      border: 1px solid rgba(220, 53, 69, 0.2);
    }
    .rotating {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  user = { name: '', email: '', college: '', password: '' };
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    this.authService.register(this.user).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/verify'], { queryParams: { email: this.user.email } });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed. Check if email is already used.';
      }
    });
  }
}
