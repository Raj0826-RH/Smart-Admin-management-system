import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

declare var bootstrap: any;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  pages: number[] = [];
  loading = false;

  searchText = '';
  sortBy = 'id';

  userForm!: FormGroup;
  isEdit = false;
  selectedUserId: number | null = null;
  showTopAlert = false;

  countriesAndStates: { [key: string]: string[] } = {
    'India': [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
      'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
      'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
      'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
      'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ],
    'USA': ['California', 'Florida', 'Illinois', 'New York', 'Texas', 'Washington'],
    'UK': ['England', 'Northern Ireland', 'Scotland', 'Wales'],
    'Australia': ['New South Wales', 'Queensland', 'Tasmania', 'Victoria', 'Western Australia'],
    'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'Ontario', 'Quebec']
  };

  availableStates: string[] = [];

  get countries(): string[] {
    return Object.keys(this.countriesAndStates);
  }

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
    this.loadUsers();
  }

  createForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zipcode: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{6}$')
      ]],
      status: ['', Validators.required]
    });
  }

  onCountryChange() {
    const selectedCountry = this.userForm.get('country')?.value;
    this.availableStates = this.countriesAndStates[selectedCountry] || [];
    this.userForm.patchValue({ state: '' });
    this.cdr.detectChanges();
  }
  loadUsers() {
    this.loading = true;

    this.userService.getUsers(1, 1000).subscribe({
      next: (res: any) => {
        const fetchedData = Array.isArray(res)
          ? res
          : (res.users || res.data || []);

        // ASCENDING ORDER: 2 → 35
        this.users = fetchedData.sort((a: any, b: any) => a.id - b.id);

        this.filteredUsers = [...this.users];
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        alert('Failed to load users');
        this.loading = false;
      }
    });
  }
  applyFilterSort(resetPage: boolean = true) {
    const text = this.searchText.trim().toLowerCase();

    // Empty search = show all users
    if (text.length === 0) {
      this.filteredUsers = [...this.users];

      if (this.sortBy === 'id') {
        this.filteredUsers.sort((a: any, b: any) => a.id - b.id);
      }

      if (this.sortBy === 'name') {
        this.filteredUsers.sort((a: any, b: any) =>
          (a.name || '').localeCompare(b.name || '')
        );
      }

      if (resetPage) {
        this.currentPage = 1;
      }

      this.updatePagination();
      return;
    }

    // Search starts after 3 chars
    if (text.length < 3) {
      return;
    }

    this.loading = true;

    this.userService.searchUsers(text).subscribe({
      next: (res: any) => {
        let data = res.data || res.users || res || [];

        if (this.sortBy === 'id') {
          data.sort((a: any, b: any) => a.id - b.id);
        }

        if (this.sortBy === 'name') {
          data.sort((a: any, b: any) =>
            (a.name || '').localeCompare(b.name || '')
          );
        }

        this.filteredUsers = data;

        if (resetPage) {
          this.currentPage = 1;
        }

        this.updatePagination();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.pages = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  showModal() {
    const modalElement = document.getElementById('userModal');
    if (!modalElement) return;

    let modal = bootstrap.Modal.getInstance(modalElement);

    if (!modal) {
      modal = new bootstrap.Modal(modalElement);
    }

    modal.show();
  }

  openAddUser() {
    this.isEdit = false;
    this.selectedUserId = null;
    this.availableStates = [];

    this.userForm.reset({
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      state: '',
      city: '',
      country: '',
      zipcode: '',
      status: ''
    });

    this.showModal();
  }

  editUser(user: any) {
    this.isEdit = true;
    this.selectedUserId = user.id;

    let first = '';
    let last = '';

    if (user.firstname || user.lastname) {
      first = user.firstname || '';
      last = user.lastname || '';
    } else if (user.name) {
      const parts = user.name.split(' ');
      first = parts[0] || '';
      last = parts.slice(1).join(' ') || '';
    }

    const userCountry = user.country || '';
    this.availableStates = this.countriesAndStates[userCountry] || [];

    this.userForm.patchValue({
      username: user.username || '',
      firstname: first,
      lastname: last,
      email: user.email || '',
      phone: user.phone || '',
      state: user.state || '',
      city: user.city || '',
      country: userCountry,
      zipcode: user.zipcode || '',
      status: user.status || ''
    });

    this.showModal();
  }

  saveUser() {
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) {
      this.showTopAlert = true;

      setTimeout(() => {
        this.showTopAlert = false;
      }, 3000);

      return;
    }

    const data = this.userForm.value;

    if (this.isEdit && this.selectedUserId !== null) {
      this.userService.updateUser(this.selectedUserId, data).subscribe({
        next: () => this.afterSuccess('User updated successfully ✅'),
        error: () =>
          this.snackBar.open('Update failed ❌', 'Close', {
            duration: 2500,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          })
      });
    } else {
      this.userService.createUser(data).subscribe({
        next: () => this.afterSuccess('User added successfully ✅'),
        error: () =>
          this.snackBar.open('Save failed ❌', 'Close', {
            duration: 2500,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          })
      });
    }
  }

  afterSuccess(msg: string) {
    this.loadUsers();

    this.snackBar.open(msg, 'Close', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });

    const modalElement = document.getElementById('userModal');
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) modal.hide();

    this.userForm.reset();
    this.isEdit = false;
    this.selectedUserId = null;
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();

        this.snackBar.open('User deleted 🗑️', 'Close', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      },
      error: () => {
        this.snackBar.open('Delete failed ❌', 'Close', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

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

  blockNonNumericPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';

    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  downloadCSV() {
    if (this.users.length === 0) {
      this.snackBar.open('No data available to download ❌', 'Close', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }

    const csvHeaders = [
      'ID', 'Username', 'First Name', 'Last Name',
      'Email', 'Phone', 'Country', 'State',
      'City', 'Zipcode', 'Status'
    ];

    const BOM = "\uFEFF";

    const sortedData = [...this.users].sort(
      (a: any, b: any) => a.id - b.id
    );

    const csvRows = sortedData.map(user => {
      const row = [
        user.id,
        user.username || '',
        user.firstname || '',
        user.lastname || '',
        user.email || '',
        user.phone || '',
        user.country || '',
        user.state || '',
        user.city || '',
        user.zipcode || '',
        user.status || ''
      ];

      return row.map(field =>
        `"${String(field).replace(/"/g, '""')}"`
      ).join(',');
    });

    const csvContent =
      BOM + [csvHeaders.join(','), ...csvRows].join('\n');

    const blob = new Blob(
      [csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', 'user_details.csv');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}