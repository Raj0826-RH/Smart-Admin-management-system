import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp implements OnInit, OnDestroy {
  loading = false;
  otpForm!: FormGroup;
  
  // Timer logic
  resendCooldown = 60;
  timerInterval: any;
  canResend = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit6: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    });

    // Defer timer to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.startTimer(), 0);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startTimer() {
    this.canResend = false;
    this.resendCooldown = 60;
    
    // Clear existing timer if any
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.resendCooldown > 0) {
        this.resendCooldown--;
        this.cdr.detectChanges(); // Force UI update
      } else {
        this.canResend = true;
        clearInterval(this.timerInterval);
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  resendCode() {
    if (!this.canResend) return;

    const contact = localStorage.getItem('user_email');
    if (!contact) return;

    this.authService.resendOtp({ contact }).subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message || 'New code sent to your email ✉️', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.startTimer();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Failed to resend OTP ❌';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    });
  }

  onInput(event: any, nextId: string) {
    const input = event.target;
    
    // 🔥 STRIP NON-NUMERIC CHARACTERS
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value && nextId) {
      const nextInput = document.getElementById(nextId) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, prevId: string) {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && prevId) {
        const prevInput = document.getElementById(prevId) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }
    }
  }

  verify() {
    this.otpForm.markAllAsTouched();
    if (this.otpForm.invalid) return;

    this.loading = true;
    
    const val = this.otpForm.value;
    const submittedOtp = `${val.digit1}${val.digit2}${val.digit3}${val.digit4}${val.digit5}${val.digit6}`;
    const contact = localStorage.getItem('user_email');

    if (!contact) {
      this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.authService.verifyOtp({ contact, otp: submittedOtp }).subscribe({
      next: (res: any) => {
        const token = localStorage.getItem('temp_token');
        if (token) {
          localStorage.setItem('token', token);
          localStorage.removeItem('temp_token');
        }
        
        // Extract username from email before cleaning up
        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) {
           const username = storedEmail.includes('@') ? storedEmail.split('@')[0] : storedEmail;
           localStorage.setItem('username', username);
        }

        localStorage.removeItem('user_email'); // Cleanup

        this.snackBar.open(res.message || 'Verification successful ✅', 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Invalid OTP code ❌';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.loading = false;
      }
    });
  }
}
