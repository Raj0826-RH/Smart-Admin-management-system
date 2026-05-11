import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

function parseJwt(token: string): any {
  try {
    const base64Payload = token.split('.')[1];
    const decodedPayload = atob(base64Payload);
    return JSON.parse(decodedPayload);
  } catch (e) {
    return null;
  }
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const decoded = parseJwt(token);

  if (!decoded || !decoded.exp) {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  if (decoded.exp < currentTime) {
    // Token expired
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  return true;
};