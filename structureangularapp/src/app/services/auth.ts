import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/api/auth';
  private otpUrl = 'http://localhost:5000/api/otp'; // Assuming OTP routes are here

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  signup(data: any) {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  verifyOtp(data: any) {
    return this.http.post(`${this.otpUrl}/verify-otp`, data);
  }

  resendOtp(data: any) {
    return this.http.post(`${this.otpUrl}/send-otp`, data);
  }
}