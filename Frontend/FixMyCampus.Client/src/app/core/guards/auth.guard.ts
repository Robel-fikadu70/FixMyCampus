import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUser();
  
  if (!user) {
    // Check if the route is for auth pages, to avoid infinite loops
    if (state.url.startsWith('/auth/')) {
      return true;
    }
    return router.parseUrl('/auth/login');
  }

  // Check roles based on route data if needed, or explicitly for specific paths
  const requiredRoles = route.data['roles'] as Array<string>;
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      // Redirect based on role if they try to access an unauthorized page
      if (user.role === 'Admin') return router.parseUrl('/admin/command-center');
      if (user.role === 'Technician') return router.parseUrl('/technician/tasks');
      return router.parseUrl('/reporter/dashboard');
    }
  }

  return true;
};
