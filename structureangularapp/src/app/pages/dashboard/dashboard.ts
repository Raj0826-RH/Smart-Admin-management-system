import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { UserService } from '../../services/user.service';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  
  // Stats
  totalUsers = 0;
  activeUsers = 0;
  totalCampaigns = 0;
  activeCampaigns = 0;

  // Chart Options
  chartOptions: Highcharts.Options | null = null;
  campaignChartOptions: Highcharts.Options | null = null;

  constructor(
    private userService: UserService, 
    private campaignService: CampaignService
  ) { }

  ngOnInit() {
    this.loadUserDashboard();
    this.loadCampaignDashboard();
  }

  // ====================================================
  // ================= USER DASHBOARD ===================
  // ====================================================
  loadUserDashboard() {
    this.userService.getUsers(1, 1000).subscribe({
      next: (res: any) => {
        const users = Array.isArray(res) ? res : (res.users || res.data || []);
        this.totalUsers = res.total || users.length;
        
        let active = 0;
        let inactive = 0;
        let unknown = 0;

        users.forEach((u: any) => {
          if (u.status === 'Active') active++;
          else if (u.status === 'Inactive') inactive++;
          else unknown++;
        });

        this.activeUsers = active;
        this.initUserChart(active, inactive, unknown);
      },
      error: () => {
        this.initUserChart(0, 0, 0);
      }
    });
  }

  initUserChart(active: number, inactive: number, unknown: number) {
    const data: any[] = [];
    if (active > 0) data.push({ name: 'Active', y: active, color: '#10b981' });
    if (inactive > 0) data.push({ name: 'Inactive', y: inactive, color: '#f59e0b' });
    if (unknown > 0) data.push({ name: 'Unknown', y: unknown, color: '#64748b' });

    if (data.length === 0) {
      data.push({ name: 'No Data', y: 1, color: '#f1f5f9' });
    }

    this.chartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: { text: '' },
      tooltip: {
        pointFormat: '<b>{point.y}</b> users ({point.percentage:.1f}%)'
      },
      accessibility: { enabled: false },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.0f}%',
            distance: -30,
            style: { color: 'white', textOutline: 'none' }
          },
          showInLegend: true,
          innerSize: '60%'
        }
      },
      series: [{
        type: 'pie',
        name: 'Users',
        data: data
      }]
    };
  }

  // ====================================================
  // ============== CAMPAIGN DASHBOARD ==================
  // ====================================================
  loadCampaignDashboard() {
    this.campaignService.getCampaigns(1, 1000).subscribe({
      next: (res: any) => {
        const campaigns = Array.isArray(res) ? res : (res.data || []);
        this.totalCampaigns = campaigns.length;

        let active = 0;
        let inactive = 0;

        campaigns.forEach((c: any) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endDate = c.endDate ? new Date(c.endDate) : null;
          const isExpired = endDate ? endDate < today : false;

          if (c.status === 'Active' && !isExpired) active++;
          else inactive++;
        });

        this.activeCampaigns = active;
        this.initCampaignChart(active, inactive);
      },
      error: () => {
        this.initCampaignChart(0, 0);
      }
    });
  }

  initCampaignChart(active: number, inactive: number) {
    const data: any[] = [];
    if (active > 0) data.push({ name: 'Active', y: active, color: '#3b82f6' });
    if (inactive > 0) data.push({ name: 'Inactive', y: inactive, color: '#94a3b8' });

    if (data.length === 0) {
      data.push({ name: 'No Campaigns', y: 1, color: '#f1f5f9' });
    }

    this.campaignChartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: { text: '' },
      tooltip: {
        pointFormat: '<b>{point.y}</b> campaigns ({point.percentage:.1f}%)'
      },
      accessibility: { enabled: false },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.0f}%',
            distance: -30,
            style: { color: 'white', textOutline: 'none' }
          },
          showInLegend: true,
          innerSize: '60%'
        }
      },
      series: [{
        type: 'pie',
        name: 'Campaigns',
        data: data
      }]
    };
  }
}