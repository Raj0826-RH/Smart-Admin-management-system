import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './audit.html',
  styleUrl: './audit.css'
})
export class Audit implements OnInit {

  audits: any[] = [];
  filteredAudits: any[] = [];

  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  loading = false;

  searchText = '';
  fromDate = '';
  toDate = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAudit(1, 5);
  }

  // ================= UNIFIED FETCH =================
  loadAudit(page: number, limit: number): void {
    this.loading = true;
    this.cdr.detectChanges();

    const effectiveLimit = (this.fromDate || this.searchText) ? 1000 : limit;
    const effectivePage = (this.fromDate || this.searchText) ? 1 : page;

    this.userService.getAuditLogs(
      effectivePage,
      effectiveLimit,
      this.fromDate,
      this.toDate,
      this.searchText
    ).subscribe({
      next: (res: any) => {
        // 🛠️ Handle both formats
        let data = res.data || (Array.isArray(res) ? res : []);

        // Date Range Filter
        if (this.fromDate && this.toDate) {
          const start = new Date(this.fromDate + 'T00:00:00').getTime();
          const end = new Date(this.toDate + 'T23:59:59').getTime();

          data = data.filter((item: any) => {
            const itemDate = new Date(item.createdAt).getTime();
            return itemDate >= start && itemDate <= end;
          });
        }

        // Sort Ascending
        data.sort((a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Search Logic
        const q = this.searchText.toLowerCase().trim();
        // If q.length is 1 or 2, do nothing to `data`, so it shows the full list.
        if (q.length >= 3) {
          // Sorting (already done above)
        }

        this.filteredAudits = (this.fromDate || this.searchText)
          ? data.slice((page - 1) * limit, page * limit)
          : data;

        this.totalRecords = (this.fromDate || this.searchText)
          ? data.length
          : (res.total || data.length);

        this.pageIndex = page - 1;
        this.pageSize = limit;
        this.loading = false; // 🏁 Stop loading immediately
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ================= SEARCH =================
  applyFilter(): void {
    const text = this.searchText.trim();
    if (text.length > 0 && text.length < 3) return; // Do nothing until 3 chars or cleared

    this.pageIndex = 0;
    this.loadAudit(1, this.pageSize);
  }

  // ================= DATE FILTER =================
  applyDateFilter(): void {
    if ((this.fromDate && this.toDate) || (!this.fromDate && !this.toDate)) {
      this.loadAudit(1, this.pageSize);
    }
  }

  // ================= RESET FILTERS =================
  resetFilters(): void {
    this.searchText = '';
    this.fromDate = '';
    this.toDate = '';
    this.pageIndex = 0;
    this.loadAudit(1, this.pageSize);
  }

  // ================= PAGINATOR =================
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAudit(this.pageIndex + 1, this.pageSize);
  }

  // ================= JSON PARSE =================
  parseData(data: any): any {
    if (!data || data === 'null') return null;

    try {
      if (typeof data === 'object') return data;

      let parsed = JSON.parse(data);

      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }

      return parsed;
    } catch {
      return null;
    }
  }

  // ================= EXPORT =================
  exportToExcel(): void {
    const rows = this.filteredAudits.map((item: any) => ({
      ID: item.id,
      Module: item.module || '-',
      Action: item.action || '-',
      OldData: this.parseData(item.oldData)?.name || '-',
      NewData: this.parseData(item.newData)?.name || '-',
      Created: item.createdAt,
      Updated: item.updatedAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = {
      Sheets: { AuditLogs: worksheet },
      SheetNames: ['AuditLogs']
    };

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const file = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const formattedFrom = this.fromDate
      ? this.fromDate.split('-').reverse().join('-')
      : '';

    const formattedTo = this.toDate
      ? this.toDate.split('-').reverse().join('-')
      : '';

    const filename = (formattedFrom && formattedTo)
      ? `${formattedFrom} to ${formattedTo}_AuditReports.xlsx`
      : 'AuditLogs.xlsx';

    FileSaver.saveAs(file, filename);
  }
}