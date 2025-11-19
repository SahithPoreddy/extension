import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Service {
  title: string;
  description: string;
  pricingType: string;
  price: number;
  duration: number;
  applyOffer: boolean;
  offerTitle?: string;
  discountPercentage?: number;
}

export interface PartnerRegistration {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  categories: string[];
  services: { [categoryId: string]: Service[] };
  sessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = '/api';
  
  private categories: Category[] = [
    { id: 'plumbing', name: 'Plumbing', icon: 'plumbing' },
    { id: 'cleaning', name: 'Cleaning', icon: 'cleaning_services' },
    { id: 'beauty', name: 'Beauty & Wellness', icon: 'spa' },
    { id: 'electrical', name: 'Electrical', icon: 'electrical_services' },
    { id: 'carpentry', name: 'Carpentry', icon: 'carpenter' },
    { id: 'painting', name: 'Painting', icon: 'format_paint' },
    { id: 'appliance', name: 'Appliance Repair', icon: 'home_repair_service' },
    { id: 'pest', name: 'Pest Control', icon: 'pest_control' }
  ];

  constructor(private http: HttpClient) { }

  getCategories(): Category[] {
    return this.categories;
  }

  generateSessionId(): string {
    return uuidv4();
  }

  registerPartner(data: PartnerRegistration): Observable<any> {
    const sessionId = this.generateSessionId();
    const registrationData = {
      ...data,
      sessionId,
      role: 'partner',
      createdAt: new Date().toISOString()
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionId}`
    });

    return this.http.post(`${this.apiUrl}/users`, registrationData, { headers });
  }

  saveSession(sessionId: string, email: string): void {
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', 'partner');
  }

  getSession(): string | null {
    return localStorage.getItem('sessionId');
  }

  clearSession(): void {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  }
}
