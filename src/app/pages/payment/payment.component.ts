import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { BookingService, BookingData } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

type PaymentMethod = 'card' | 'upi' | 'cash';

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  partnerId: string;
  partnerName: string;
  date: string;
  time: string;
  duration: string;
  address: any;
  additionalInstructions?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-payment',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  selectedPaymentMethod: PaymentMethod | null = null;
  bookingData: BookingData | null = null;
  totalAmount = 0;
  
  cardForm: FormGroup;
  upiForm: FormGroup;
  
  isProcessing = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private bookingService: BookingService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Initialize card form
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      cardholderName: ['', Validators.required]
    });

    // Initialize UPI form
    this.upiForm = this.fb.group({
      upiId: ['', [Validators.required, Validators.pattern(/^[\w.-]+@[\w.-]+$/)]]
    });
  }

  ngOnInit(): void {
    this.bookingData = this.bookingService.getBookingData();
    
    // Verify all booking steps are completed
    if (!this.bookingData || !this.bookingData.selectedDate || !this.bookingData.selectedAddress) {
      this.router.navigate(['/booking/schedule']);
      return;
    }

    const priceDetails = this.bookingService.calculateTotal();
    this.totalAmount = priceDetails.total;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardForm.patchValue({ cardNumber: value }, { emitEvent: false });
    event.target.value = formattedValue;
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardForm.patchValue({ expiryDate: value }, { emitEvent: false });
    event.target.value = value;
  }

  getCardError(fieldName: string): string {
    const control = this.cardForm.get(fieldName);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('pattern')) {
      if (fieldName === 'cardNumber') return 'Enter 16-digit card number';
      if (fieldName === 'expiryDate') return 'Enter valid expiry (MM/YY)';
      if (fieldName === 'cvv') return 'Enter 3-digit CVV';
    }
    return '';
  }

  getUpiError(): string {
    const control = this.upiForm.get('upiId');
    if (control?.hasError('required')) return 'UPI ID is required';
    if (control?.hasError('pattern')) return 'Enter valid UPI ID (e.g., user@bank)';
    return '';
  }

  canProceed(): boolean {
    if (!this.selectedPaymentMethod) return false;
    
    if (this.selectedPaymentMethod === 'card') {
      return this.cardForm.valid;
    } else if (this.selectedPaymentMethod === 'upi') {
      return this.upiForm.valid;
    } else if (this.selectedPaymentMethod === 'cash') {
      return true;
    }
    
    return false;
  }

  async processPayment(): Promise<void> {
    if (!this.canProceed() || !this.bookingData || this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      // Get current user
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        alert('Please login to continue');
        this.router.navigate(['/user/login']);
        return;
      }

      // Create booking object
      const bookingId = 'BK' + Date.now();
      const booking: Booking = {
        id: bookingId,
        userId: currentUser.userId,
        serviceId: this.bookingData.serviceId,
        serviceName: this.bookingData.serviceName,
        partnerId: '001', // In real app, get from service data
        partnerName: 'CleanPro Services', // In real app, get from service data
        date: this.bookingData.selectedDate!.toISOString().split('T')[0],
        time: this.bookingData.selectedTime!,
        duration: this.bookingData.serviceDuration,
        address: this.bookingData.selectedAddress,
        additionalInstructions: this.bookingData.additionalInstructions,
        amount: this.totalAmount,
        paymentMethod: this.getPaymentMethodName(),
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };

      // Save booking to backend
      await this.http.post('/api/bookings', booking).toPromise();

      // Create notifications
      await this.createNotifications(booking);

      // Clear booking data
      this.bookingService.clearBooking();

      // Navigate to confirmation page
      this.router.navigate(['/booking/confirmation', bookingId]);

    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  getPaymentMethodName(): string {
    switch (this.selectedPaymentMethod) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI';
      case 'cash':
        return 'Pay on Service';
      default:
        return '';
    }
  }

  async createNotifications(booking: Booking): Promise<void> {
    const userNotification = {
      id: 'NOT' + Date.now(),
      userId: booking.userId,
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Your booking for ${booking.serviceName} is confirmed for ${booking.date}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      icon: 'check_circle',
      iconColor: '#4caf50',
      actionRoute: '/user/bookings',
      actionId: booking.id
    };

    const partnerNotification = {
      id: 'NOT' + (Date.now() + 1),
      partnerId: booking.partnerId,
      type: 'booking',
      title: 'New Booking Received',
      message: `New booking for ${booking.serviceName} on ${booking.date}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      icon: 'event_available',
      iconColor: '#4caf50',
      actionRoute: '/partner/bookings',
      actionId: booking.id
    };

    try {
      await Promise.all([
        this.http.post('/api/notifications', userNotification).toPromise(),
        this.http.post('/api/notifications', partnerNotification).toPromise()
      ]);
    } catch (error) {
      console.error('Error creating notifications:', error);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/booking/summary']);
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
