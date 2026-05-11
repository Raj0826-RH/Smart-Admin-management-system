import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';

import { UserService } from '../../services/user.service';

/* Material */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css'
})
export class AddUser implements OnInit {

  userForm!: FormGroup;

  countries: string[] = [
    'India', 'USA', 'UK', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'Brazil'
  ];

  states: string[] = [
    'Andhra Pradesh',
    'Telangana',
    'Tamil Nadu',
    'Karnataka',
    'Kerala',
    'Maharashtra',
    'Delhi',
    'Gujarat',
    'Punjab',
    'Rajasthan'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],

      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
          )
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      state: ['', Validators.required],
      country: ['', Validators.required],

      zipcode: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{6}$')
        ]
      ]
    });
  }

  /* Only Numbers Allowed While Typing (Numpad Supported) */
  numbersOnly(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    if (
      (charCode >= 48 && charCode <= 57) || 
      (charCode >= 96 && charCode <= 105) ||
      [8, 9, 13, 37, 38, 39, 40, 46].includes(charCode)
    ) {
      return true;
    }

    event.preventDefault();
    return false;
  }

  /* Block Text Paste */
  blockNonNumericPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';

    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  addUser() {
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) return;

    this.userService.createUser(this.userForm.value as any).subscribe(() => {

      this.userForm.reset();

      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.setErrors(null);
      });

      this.userForm.markAsPristine();
      this.userForm.markAsUntouched();

      this.snackBar.open('User added successfully ✅', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });

    });
  }
}
