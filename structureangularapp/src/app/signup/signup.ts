import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

declare var bootstrap: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit, AfterViewInit {

  hidePassword = true;
  loading = false;
  signupForm!: FormGroup; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,            // ✅ Added
    private snackBar: MatSnackBar     // ✅ Added
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],

      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
      ]],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]]
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

  get f() {
    return this.signupForm.controls;
  }

  signup() {
    if (this.signupForm.valid) {
      this.loading = true;

      this.authService.signup(this.signupForm.value).subscribe({

        next: () => {
          this.loading = false;
          // ✅ Snackbar instead of alert
          this.snackBar.open('Signup Successful 🎉 Please login', 'Close', {
            duration: 3000
          });

          // ✅ Reset form
          this.signupForm.reset();

          // ✅ Redirect to login
          this.router.navigate(['/login']);
        },

        error: (err: any) => {
          this.loading = false;
          const message = err.error?.msg || "Signup failed ❌";

          this.snackBar.open(message, 'Close', {
            duration: 3000
          });
        }
      });

    } else {

      this.signupForm.markAllAsTouched();

      if (this.f['name'].errors) {
        alert("Name must be at least 3 characters");
      } 
      else if (this.f['email'].errors) {
        alert("Enter a valid email");
      } 
      else if (this.f['password'].errors) {
        alert("Password must contain uppercase, lowercase, number, and special character");
      } 
      else if (this.f['phone'].errors) {
        alert("Enter valid 10-digit phone number");
      }
    }
  }
}