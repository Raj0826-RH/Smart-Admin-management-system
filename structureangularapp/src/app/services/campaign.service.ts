import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  private baseUrl = 'http://localhost:5000/api/campaign';

  constructor(private http: HttpClient) { }

  getCampaigns(page: number = 1, limit: number = 5, startDate?: string, endDate?: string, q?: string): Observable<any> {
    if (q) {
      return this.http.get<any>(`${this.baseUrl}/search?q=${q}&page=${page}&limit=${limit}`);
    }

    let url = `${this.baseUrl}?page=${page}&limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    return this.http.get<any>(url);
  }

  createCampaign(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data);
  }

  updateCampaign(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteCampaign(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  // ================= CAMPAIGN MANAGEMENT =================



  // Search Function
  searchCampaign(q: string) {
    return this.getCampaigns(1, 100, undefined, undefined, q);
  }


  // Date Range Filter
  filterCampaignByRange(fromDate: string, toDate: string) {
    return this.getCampaigns(1, 100, fromDate, toDate);
  }
}
