import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const PublicGuard: CanActivateFn = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn) {
    return true;
  } else if (authService.isLoggedIn && authService.isOwner()) {
    router.navigate(['/owner/dashboard']);
    return false;
  } else if (authService.isLoggedIn && authService.isCustomer()) {
    router.navigate(['/dashboard']);
    return false;
  } else {
    router.navigate(['/']);
    return false;
  }
};
