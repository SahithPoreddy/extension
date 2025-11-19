import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

interface BookingDetails {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  duration: string;
  address: any;
  amount: number;
  paymentMethod: string;
  status: string;
}

@Component({
  selector: 'app-booking-confirmation',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.css'
})
export class BookingConfirmationComponent implements OnInit {
  bookingId: string = '';
  booking: BookingDetails | null = null;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookingId = params['id'];
      this.loadBookingDetails();
    });
  }

  loadBookingDetails(): void {
    // In real app, fetch from API
    this.http.get<BookingDetails>(`/api/bookings/${this.bookingId}`).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.isLoading = false;
        // Use mock data if API fails
        this.booking = {
          id: this.bookingId,
          serviceName: 'Deep Home Cleaning',
          date: '2025-01-25',
          time: '10:00 AM',
          duration: '2-3 hours',
          address: {
            type: 'Home',
            addressLine1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          amount: 949,
          paymentMethod: 'Credit/Debit Card',
          status: 'Confirmed'
        };
      }
    });
  }

  getFormattedDate(): string {
    if (!this.booking) return '';
    const date = new Date(this.booking.date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  navigateToBookings(): void {
    this.router.navigate(['/user/bookings']);
  }

  downloadReceipt(): void {
    alert('Receipt download functionality will be implemented!');
  }
}
