import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  
  if (!user) {
    router.navigate(['/user/login']);
    return false;
  }

  if (user.role !== 'user') {
    router.navigate(['/partner/dashboard']);
    return false;
  }

  return true;
};
