import { Routes } from '@angular/router';

import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Profile } from './profile/profile';
import { VerifyOtp } from './verify-otp/verify-otp';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Dashboard } from './pages/dashboard/dashboard';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  // 🔁 Default Route
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔓 Public Routes (no layout)
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'forgot-password', component: ForgotPassword },

  // 🔐 Protected Routes (directly at root now)
  {
    path: '',
    canActivateChild: [authGuard], // Apply guard to all children
    children: [
      // 🏠 Dashboard
      { path: 'dashboard', component: Dashboard },

      // 👤 Profile
      { path: 'profile', component: Profile },

      // 👥 Users List Page
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users')
            .then(m => m.Users)
      },

      // 📊 Audit Logs Page
      {
        path: 'audit',
        loadComponent: () =>
          import('./pages/audit/audit')
            .then(m => m.Audit)
      },

      // 📢 Campaign Management
      {
        path: 'CampaignManagement',
        loadComponent: () =>
          import('./pages/campaign-management/campaign-management')
            .then(m => m.CampaignManagement)
      }
    ]
  },

  // 🚫 Fallback
  { path: '**', redirectTo: 'login' }
];