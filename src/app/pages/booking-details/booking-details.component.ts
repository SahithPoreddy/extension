import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface BookingDetails {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  partnerId: string;
  partnerName: string;
  partnerRating?: number;
  partnerReviews?: number;
  date: string;
  time: string;
  duration: string;
  address: {
    type: string;
    addressLine1: string;
    addressLine2: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  additionalInstructions?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface Review {
  id?: string;
  bookingId: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  customerName?: string;
  serviceName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, FormsModule],
  template: `
    <div class="review-dialog">
      <div class="review-dialog-header">
        <h2>Leave a Review</h2>
        <button mat-icon-button (click)="closeDialog()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="review-dialog-content">
        <div class="provider-info">
          <div class="provider-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="provider-details">
            <h3>{{ partnerName }}</h3>
            <p>{{ serviceName }}</p>
          </div>
        </div>

        <div class="rating-section">
          <h4>Rate your experience</h4>
          <div class="star-rating">
            @for (star of [1, 2, 3, 4, 5]; track star) {
              <button 
                class="star-button" 
                [class.selected]="star <= selectedRating"
                [class.hover]="star <= hoverRating"
                (click)="selectRating(star)"
                (mouseenter)="hoverRating = star"
                (mouseleave)="hoverRating = 0">
                <mat-icon>{{ star <= (hoverRating || selectedRating) ? 'star' : 'star_border' }}</mat-icon>
              </button>
            }
          </div>
          <p class="rating-text">{{ getRatingText() }}</p>
        </div>

        <div class="comment-section">
          <h4>Write your review (optional)</h4>
          <textarea 
            [(ngModel)]="comment" 
            placeholder="Tell us about your experience..."
            rows="4"
            maxlength="500"></textarea>
          <p class="char-count">{{ comment.length }}/500</p>
        </div>
      </div>

      <div class="review-dialog-actions">
        <button mat-stroked-button (click)="closeDialog()">Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          [disabled]="selectedRating === 0"
          (click)="submitReview()">
          Submit Review
        </button>
      </div>
    </div>
  `,
  styles: [`
    .review-dialog {
      width: 500px;
      max-width: 90vw;
    }

    .review-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .review-dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .review-dialog-content {
      padding: 24px;
    }

    .provider-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .provider-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #ff6b35;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .provider-avatar mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .provider-details h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .provider-details p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .rating-section {
      margin-bottom: 24px;
    }

    .rating-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .star-rating {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 8px;
    }

    .star-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: transform 0.2s ease;
    }

    .star-button:hover {
      transform: scale(1.1);
    }

    .star-button mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #ddd;
      transition: color 0.2s ease;
    }

    .star-button.hover mat-icon,
    .star-button.selected mat-icon {
      color: #ffc107;
    }

    .rating-text {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin: 8px 0 0 0;
      min-height: 20px;
    }

    .comment-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .comment-section textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
    }

    .comment-section textarea:focus {
      outline: none;
      border-color: #ff6b35;
    }

    .char-count {
      text-align: right;
      font-size: 12px;
      color: #999;
      margin: 4px 0 0 0;
    }

    .review-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      .review-dialog {
        width: 100%;
      }

      .star-button mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class ReviewDialogComponent {
  selectedRating = 0;
  hoverRating = 0;
  comment = '';
  partnerName = '';
  serviceName = '';

  constructor(
    private dialog: MatDialog
  ) {}

  selectRating(rating: number): void {
    this.selectedRating = rating;
  }

  getRatingText(): string {
    switch (this.selectedRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  submitReview(): void {
    if (this.selectedRating === 0) return;
    this.dialog.closeAll();
  }
}

@Component({
  selector: 'app-booking-details',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css'
})
export class BookingDetailsComponent implements OnInit {
  booking: BookingDetails | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBooking(bookingId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  loadBooking(bookingId: string): void {
    this.http.get<BookingDetails>(`/api/bookings/${bookingId}`).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getFormattedDate(): string {
    if (!this.booking) return '';
    const date = new Date(this.booking.date);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  getFormattedCreatedDate(): string {
    if (!this.booking) return '';
    const date = new Date(this.booking.createdAt);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  }

  getAddressIcon(): string {
    if (!this.booking) return 'location_on';
    switch (this.booking.address.type) {
      case 'Home':
        return 'home';
      case 'Office':
        return 'business';
      default:
        return 'location_on';
    }
  }

  getFullAddress(): string {
    if (!this.booking) return '';
    const addr = this.booking.address;
    let fullAddress = `${addr.addressLine1}, ${addr.addressLine2}`;
    if (addr.landmark) {
      fullAddress += `, ${addr.landmark}`;
    }
    fullAddress += `, ${addr.city}, ${addr.state} - ${addr.pincode}`;
    return fullAddress;
  }

  getPaymentMethodDisplay(): string {
    if (!this.booking) return '';
    switch (this.booking.paymentMethod) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI';
      case 'cash':
        return 'Pay on Service';
      default:
        return this.booking.paymentMethod;
    }
  }

  getStatusClass(): string {
    if (!this.booking) return '';
    switch (this.booking.status) {
      case 'Upcoming':
        return 'status-upcoming';
      case 'In Progress':
        return 'status-progress';
      case 'Completed':
        return 'status-completed';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  navigateBack(): void {
    this.router.navigate(['/user/bookings']);
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }

  cancelBooking(): void {
    if (!this.booking) return;
    
    const confirmCancel = confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Update booking status to Cancelled
    const updatedBooking = { ...this.booking, status: 'Cancelled' };
    this.http.put(`/api/bookings/${this.booking.id}`, updatedBooking).subscribe({
      next: () => {
        // Create notifications for user and partner
        this.createCancellationNotifications(currentUser.id, this.booking!);
        
        if (this.booking) {
          this.booking.status = 'Cancelled';
        }
        
        alert('Booking cancelled successfully');
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    });
  }

  createCancellationNotifications(userId: string, booking: BookingDetails): void {
    const timestamp = new Date().toISOString();

    // Notification for user
    const userNotification: Notification = {
      id: `NOT${Date.now()}U`,
      userId: userId,
      type: 'booking',
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.serviceName} on ${this.getFormattedDate()} has been cancelled.`,
      timestamp: timestamp,
      isRead: false,
      icon: 'event_busy',
      iconColor: '#f44336'
    };

    // Notification for partner
    const partnerNotification: Notification = {
      id: `NOT${Date.now()}P`,
      userId: booking.partnerId,
      type: 'booking',
      title: 'Booking Cancelled',
      message: `Booking for ${booking.serviceName} on ${this.getFormattedDate()} has been cancelled by the user.`,
      timestamp: timestamp,
      isRead: false,
      icon: 'event_busy',
      iconColor: '#f44336'
    };

    // Send notifications
    this.http.post('/api/notifications', userNotification).subscribe({
      error: (error) => console.error('Error creating user notification:', error)
    });

    this.http.post('/api/notifications', partnerNotification).subscribe({
      error: (error) => console.error('Error creating partner notification:', error)
    });
  }

  rescheduleBooking(): void {
    // Placeholder for reschedule functionality
    alert('Reschedule functionality will be implemented in a future update.');
  }

  openChatWithProvider(): void {
    // Placeholder for chat functionality
    alert('Chat functionality will be implemented in a future update.');
  }

  callProvider(): void {
    // Placeholder for call functionality
    alert('Call functionality will be implemented in a future update.');
  }

  leaveReview(): void {
    if (!this.booking) return;

    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false
    });

    const dialogComponent = dialogRef.componentInstance;
    dialogComponent.partnerName = this.booking.partnerName;
    dialogComponent.serviceName = this.booking.serviceName;

    dialogRef.afterClosed().subscribe(() => {
      // Check if review was submitted
      if (dialogComponent.selectedRating > 0) {
        this.submitReview(dialogComponent.selectedRating, dialogComponent.comment);
      }
    });
  }

  submitReview(rating: number, comment: string): void {
    if (!this.booking) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const review: Review = {
      id: `REV${Date.now()}`,
      bookingId: this.booking.id,
      userId: currentUser.id,
      partnerId: this.booking.partnerId,
      partnerName: this.booking.partnerName,
      customerName: currentUser.userName || 'Customer',
      serviceName: this.booking.serviceName,
      rating: rating,
      comment: comment || undefined,
      createdAt: new Date().toISOString()
    };

    this.http.post('/api/userReviews', review).subscribe({
      next: () => {
        alert('Thank you for your review!');
        // Refresh booking to show updated state
        this.loadBooking(this.booking!.id);
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
      }
    });
  }

  showRescheduleButton(): boolean {
    if (!this.booking) return false;
    return this.booking.status === 'Confirmed' || this.booking.status === 'Upcoming';
  }

  showCancelButton(): boolean {
    if (!this.booking) return false;
    return this.booking.status === 'Confirmed' || 
           this.booking.status === 'Upcoming' || 
           this.booking.status === 'In Progress';
  }

  showLeaveReviewButton(): boolean {
    if (!this.booking) return false;
    return this.booking.status === 'Completed';
  }

  getShortAddress(): string {
    if (!this.booking) return '';
    const addr = this.booking.address;
    return `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.pincode}`;
  }
}
