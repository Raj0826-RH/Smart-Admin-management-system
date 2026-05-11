import { Component, OnInit, AfterViewInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import * as CryptoJS from 'crypto-js';

// Material
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, AfterViewInit {

  hidePassword = true;
  loading = false;
  loginForm!: FormGroup;

  // 🔐 AES SECRET KEY (must match backend)
  private readonly SECRET_KEY = 'mySuperSecretKey123';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}$')
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit() {
    const carouselElement = document.getElementById('carouselExample');
    if (carouselElement && typeof bootstrap !== 'undefined') {
      new bootstrap.Carousel(carouselElement, {
        interval: 3000,
        ride: 'carousel'
      });
    }
  }

  login() {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) return;

    this.loading = true;

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    const payload = {
      email: email,
      password: password
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {

        // TEMP TOKEN → OTP flow
        localStorage.setItem('temp_token', res.token);
        localStorage.setItem('user_email', email); // ✅ Store email for OTP

        // 🔥 TRIGGER OTP SEND IMMEDIATELY
        this.authService.resendOtp({ contact: email }).subscribe({
          next: () => {
             this.snackBar.open('OTP sent to your email 📩', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.router.navigate(['/verify-otp']);
          },
          error: () => {
            this.snackBar.open('Failed to send OTP. Please try again.', 'Close', { duration: 3000 });
          }
        });

        this.loading = false;
      },
      error: (err: any) => {
        const errorMsg = err.error?.msg || 'Invalid credentials ❌';
        
        this.snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.loading = false;
      },
    });
  }
}