import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page container fade-in mt-5">
      <div class="settings-card mx-auto">
        <h1 class="settings-title">Account Settings</h1>
        
        <div class="settings-section">
          <h3>Profile Information</h3>
          <div class="form-group mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" [(ngModel)]="name" placeholder="Your Name">
          </div>
          <div class="form-group mb-3">
            <label class="form-label">College/University</label>
            <input type="text" class="form-control" [(ngModel)]="college" placeholder="College Name">
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Email (Locked)</label>
            <input type="text" class="form-control" [value]="user?.email" disabled>
          </div>
          <button class="btn btn-primary" [disabled]="loading" (click)="saveProfile()">
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

        <hr class="my-5">

        <div class="settings-section">
          <h3>Security</h3>
          <div class="form-group mb-3">
            <label class="form-label">New Password</label>
            <input type="password" class="form-control" [(ngModel)]="newPassword" placeholder="Minimum 6 characters">
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-control" [(ngModel)]="confirmPassword" placeholder="Repeat password">
          </div>
          <button class="btn btn-outline" [disabled]="!newPassword || newPassword !== confirmPassword || loadingSecret" (click)="savePassword()">
            Change Password
          </button>
          <div *ngIf="newPassword && newPassword !== confirmPassword" class="text-danger mt-2">Passwords do not match</div>
        </div>

        <div *ngIf="message" class="alert alert-success mt-4">{{message}}</div>
        <div *ngIf="error" class="alert alert-danger mt-4">{{error}}</div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { padding-bottom: 5rem; }
    .settings-card {
      max-width: 700px; background: white; border: 1px solid var(--border-color);
      border-radius: 24px; padding: 3rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }
    .settings-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 3rem; text-align: center; }
    h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; color: #1d5f8f; }
    .form-label { font-weight: 600; color: var(--text-darker); margin-bottom: 0.5rem; }
    .form-control { padding: 0.75rem 1rem; border-radius: 12px; }
    .btn-block { width: 100%; padding: 1rem; }
  `]
})
export class SettingsComponent implements OnInit {
  user?: User;
  name = '';
  college = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  loadingSecret = false;
  message = '';
  error = '';

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const userId = this.authService.getCurrentUserId();
    this.userService.getProfile(userId).subscribe(u => {
      this.user = u;
      this.name = u.name;
      this.college = u.college;
    });
  }

  saveProfile() {
    if (!this.user) return;
    this.loading = true;
    this.error = '';
    this.message = '';
    this.userService.updateProfile(this.user.id, { name: this.name, college: this.college }).subscribe({
      next: () => {
        this.message = 'Profile updated successfully!';
        this.loading = false;
        // Optionally update local storage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.name = this.name;
        storedUser.college = this.college;
        localStorage.setItem('user', JSON.stringify(storedUser));
      },
      error: () => {
        this.error = 'Failed to update profile. Please try again.';
        this.loading = false;
      }
    });
  }

  savePassword() {
    // Implement password update logic (requires extending UserService/Backend)
    this.message = 'Password change feature is ready but requires server-side hash update activation.';
  }
}

