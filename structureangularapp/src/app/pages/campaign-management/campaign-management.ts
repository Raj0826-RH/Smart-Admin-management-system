import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-campaign-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule
  ],
  templateUrl: './campaign-management.html',
  styleUrl: './campaign-management.css'
})
export class CampaignManagement implements OnInit {

  campaigns: any[] = [];
  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;

  showModal = false;
  isEditing = false;
  selectedCampaignId: number | null = null;

  campaignForm!: FormGroup;
  searchText = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCampaigns(true);
  }

  // ================= FORM =================
  initForm(): void {
    this.campaignForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      des: ['', [Validators.required, Validators.minLength(5)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['Active', Validators.required]
    }, {
      validators: [this.dateRangeValidator, this.statusValidator]
    });
  }

  // ================= LOAD CAMPAIGNS =================
  loadCampaigns(showLoader: boolean = true): void {

    if (showLoader) {
      this.loading = true;
    }

    this.campaignService.getCampaigns(1, 1000).subscribe({
      next: (res: any) => {
        const rawData = res.data || (Array.isArray(res) ? res : []);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = rawData.map((c: any) => {
          const endDate = c.endDate ? new Date(c.endDate) : null;
          const expired = endDate ? endDate < today : false;

          return {
            ...c,
            status:
              c.status === 'Active' && expired
                ? 'Inactive'
                : c.status
          };
        });

        // Show only active campaigns
        filtered = filtered.filter((c: any) => c.status === 'Active');

        // ================= SEARCH =================
        const q = this.searchText.trim().toLowerCase();

        if (q.length >= 3) {
          filtered = filtered.filter((c: any) =>
            c.id.toString().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.des.toLowerCase().includes(q)
          );
        }

        filtered.sort((a: any, b: any) => a.id - b.id);

        this.totalRecords = filtered.length;

        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;

        this.campaigns = filtered.slice(start, end);

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load campaigns', err);
        this.loading = false;
      }
    });
  }

  // ================= SEARCH FILTER =================
  applyFilter(): void {
    const text = this.searchText.trim();

    this.pageIndex = 0;

    // If cleared => reload all campaigns
    if (text.length === 0) {
      this.loadCampaigns(false);
      return;
    }

    // Wait until 3 chars
    if (text.length < 3) {
      return;
    }

    // Search after 3 chars
    this.loadCampaigns(false);
  }

  // ================= PAGINATION =================
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCampaigns(true);
  }

  // ================= MODAL =================
  openModal(campaign?: any): void {
    this.showModal = true;

    if (campaign) {
      this.isEditing = true;
      this.selectedCampaignId = campaign.id;

      this.campaignForm.patchValue({
        name: campaign.name,
        des: campaign.des,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status
      });

    } else {
      this.isEditing = false;
      this.selectedCampaignId = null;

      this.campaignForm.reset({
        status: 'Active'
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.campaignForm.reset({
      status: 'Active'
    });
  }

  // ================= SAVE =================
  saveCampaign(): void {
    if (this.campaignForm.invalid) {
      this.campaignForm.markAllAsTouched();
      return;
    }

    const data = this.campaignForm.value;

    if (this.isEditing && this.selectedCampaignId !== null) {

      this.campaignService
        .updateCampaign(this.selectedCampaignId, data)
        .subscribe({
          next: () => {
            this.loadCampaigns(true);
            this.closeModal();
          },
          error: (err) => console.error('Update failed', err)
        });

    } else {

      this.campaignService
        .createCampaign(data)
        .subscribe({
          next: () => {
            this.loadCampaigns(true);
            this.closeModal();
          },
          error: (err) => console.error('Save failed', err)
        });
    }
  }

  // ================= DELETE =================
  deleteCampaign(id: number): void {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    this.campaignService.deleteCampaign(id).subscribe({
      next: () => {
        this.loadCampaigns(true);
      },
      error: (err) => console.error('Delete failed', err)
    });
  }

  // ================= VALIDATORS =================
  dateRangeValidator(group: FormGroup): any {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      return { dateRange: true };
    }

    return null;
  }

  statusValidator(group: FormGroup): any {
    const end = group.get('endDate')?.value;
    const status = group.get('status')?.value;

    if (status === 'Active' && end && new Date(end) < new Date()) {
      return { expiredActive: true };
    }

    return null;
  }
}