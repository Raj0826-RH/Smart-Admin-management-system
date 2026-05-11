import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // ================= USERS =================

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user-details/adduser`, data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/user-details/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user-details/${id}`);
  }

  getUsers(page: number = 1, limit: number = 5): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/user-details?page=${page}&limit=${limit}`
    );
  }

  searchUsers(q: string) {
    return this.http.get<any>(`${this.baseUrl}/user-details/search?q=${q}`);
  }
  // ================= AUDIT LOGS =================

  getAuditLogs(
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    q?: string
  ): Observable<any> {

    if (q) {
      return this.http.get<any>(
        `${this.baseUrl}/audit/search?q=${q}&page=${page}&limit=${limit}`
      );
    }

    let url = `${this.baseUrl}/audit?page=${page}&limit=${limit}`;

    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    return this.http.get<any>(url);
  }

  searchAudit(q: string): Observable<any> {
    return this.getAuditLogs(1, 100, undefined, undefined, q);
  }

  filterAuditByRange(fromDate: string, toDate: string): Observable<any> {
    return this.getAuditLogs(1, 100, fromDate, toDate);
  }
}