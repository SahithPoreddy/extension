import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const partnerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  
  if (!user) {
    router.navigate(['/partner/login']);
    return false;
  }

  if (user.role !== 'partner') {
    router.navigate(['/user/dashboard']);
    return false;
  }

  return true;
};
