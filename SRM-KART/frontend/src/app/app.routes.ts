import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { ListingDetailComponent } from './pages/listing/listing-detail.component';
import { SearchComponent } from './pages/search/search.component';
import { PostListingComponent } from './pages/listing/post-listing.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InboxComponent } from './pages/inbox/inbox.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'listing/:id', component: ListingDetailComponent },
  { path: 'sell', component: PostListingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inbox', component: InboxComponent },
  { path: '**', redirectTo: '' }
];
