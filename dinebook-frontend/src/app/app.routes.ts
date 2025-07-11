import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { SignInComponent } from './pages/sign-in/sign-in';
import { SignUpComponent } from './pages/sign-up/sign-up';
import { VerifyComponent } from './pages/verify/verify';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { OwnerDashboardComponent } from './pages/owner-dashboard/owner-dashboard';
import { RestaurantsComponent } from './pages/restaurants/restaurants';
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { BookTableComponent } from './pages/book-table/book-table';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'owner/dashboard', component: OwnerDashboardComponent },
  { path: 'restaurants', component: RestaurantsComponent },
  { path: 'book-table', component: BookTableComponent },
  { path: 'book-table/:restaurantId', component: BookTableComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'booking-confirmation/:bookingId', component: BookingConfirmationComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '/landing' }
];