import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const OwnerGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn && authService.isOwner()) {
    return true;
  } else {
    router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
