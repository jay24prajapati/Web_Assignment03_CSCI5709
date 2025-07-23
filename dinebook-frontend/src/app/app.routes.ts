import { Routes } from '@angular/router';
import { PublicGuard } from './guards/public.guard';
import { CustomerGuard } from './guards/customer.guard';
import { OwnerGuard } from './guards/owner.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { 
    path: 'landing', 
    loadComponent: () => import('./pages/landing/landing').then(m => m.LandingComponent)
  },
  { 
    path: 'sign-in', 
    loadComponent: () => import('./pages/sign-in/sign-in').then(m => m.SignInComponent),
    canActivate: [PublicGuard]  
  },
  { 
    path: 'sign-up', 
    loadComponent: () => import('./pages/sign-up/sign-up').then(m => m.SignUpComponent),
    canActivate: [PublicGuard]
  },
  { 
    path: 'verify', 
    loadComponent: () => import('./pages/verify/verify').then(m => m.VerifyComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [CustomerGuard]
  },
  { 
    path: 'owner/dashboard', 
    loadComponent: () => import('./pages/owner-dashboard/owner-dashboard').then(m => m.OwnerDashboardComponent),
    canActivate: [OwnerGuard]
  },
  { 
    path: 'restaurants', 
    loadComponent: () => import('./pages/restaurants/restaurants').then(m => m.RestaurantsComponent)
  },
  { 
    path: 'restaurants/:id', 
    loadComponent: () => import('./pages/restaurant-detail/restaurant-detail').then(m => m.RestaurantDetailComponent)
  },
  { 
    path: 'book-table', 
    loadComponent: () => import('./pages/book-table/book-table').then(m => m.BookTableComponent),
    canActivate: [CustomerGuard]
  },
  { 
    path: 'book-table/:restaurantId', 
    loadComponent: () => import('./pages/book-table/book-table').then(m => m.BookTableComponent),
    canActivate: [CustomerGuard]
  },
  { 
    path: 'my-bookings', 
    loadComponent: () => import('./pages/my-bookings/my-bookings').then(m => m.MyBookingsComponent),
    canActivate: [CustomerGuard]
  },
  { 
    path: 'booking-confirmation/:bookingId', 
    loadComponent: () => import('./components/booking-confirmation/booking-confirmation').then(m => m.BookingConfirmationComponent),
    canActivate: [CustomerGuard]
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  { path: '**', redirectTo: '/landing' }
];
