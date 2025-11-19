import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BookingService, BookingData } from '../../services/booking.service';

@Component({
  selector: 'app-booking-summary',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.css'
})
export class BookingSummaryComponent implements OnInit {
  bookingData: BookingData | null = null;
  priceDetails: {
    subtotal: number;
    discount: number;
    convenienceFee: number;
    total: number;
  } | null = null;

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.bookingData = this.bookingService.getBookingData();
    
    // Check if all booking steps are completed
    if (!this.bookingData || !this.bookingData.selectedDate || !this.bookingData.selectedAddress) {
      this.router.navigate(['/booking/schedule']);
      return;
    }

    this.priceDetails = this.bookingService.calculateTotal();
  }

  getFormattedDate(): string {
    if (!this.bookingData?.selectedDate) return '';
    
    const date = this.bookingData.selectedDate;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  getFormattedTime(): string {
    if (!this.bookingData?.selectedTime) return '';
    return this.bookingData.selectedTime;
  }

  getAddressLine(): string {
    if (!this.bookingData?.selectedAddress) return '';
    const addr = this.bookingData.selectedAddress;
    let line = `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.pincode}`;
    return line;
  }

  proceedToPayment(): void {
    this.router.navigate(['/booking/payment']);
  }

  navigateBack(): void {
    this.router.navigate(['/booking/address']);
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
