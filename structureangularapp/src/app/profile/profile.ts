import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  username = 'User';
  email = 'user@example.com';
  role = 'Admin';
  contact = '+91 9876543210';
  address = 'Hyderabad, Telangana';

  isEditMode = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'User';
    this.email = localStorage.getItem('email') || 'user@example.com';
    this.contact = localStorage.getItem('contact') || '+91 9876543210';
    this.address = localStorage.getItem('address') || 'Hyderabad, Telangana';
  }

  editProfile(): void {
    this.isEditMode = true;
  }

  saveProfile(): void {
    localStorage.setItem('username', this.username);
    localStorage.setItem('email', this.email);
    localStorage.setItem('contact', this.contact);
    localStorage.setItem('address', this.address);

    this.isEditMode = false;
  }

  cancelEdit(): void {
    this.ngOnInit();
    this.isEditMode = false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}