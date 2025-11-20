import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../services/auth.service';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerInitials: string;
  serviceId: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
  partnerResponse?: string;
  responseDate?: string;
}

interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

interface Service {
  id: string;
  title: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements OnInit {
  menuItems = [
    { name: 'Dashboard', route: '/partner/dashboard', icon: 'dashboard' },
    { name: 'Profile', route: '/partner/profile', icon: 'person' },
    { name: 'Manage Services', route: '/partner/services', icon: 'build' },
    { name: 'Portfolio', route: '/partner/portfolio', icon: 'photo_library' },
    { name: 'My Bookings', route: '/partner/bookings', icon: 'event_note', badge: 3 },
    { name: 'Earnings', route: '/partner/earnings', icon: 'account_balance_wallet' },
    { name: 'Reviews', route: '/partner/reviews', icon: 'star', badge: 5 },
    { name: 'Notifications', route: '/partner/notifications', icon: 'notifications', badge: 5 },
    { name: 'Support', route: '/partner/support', icon: 'help' }
  ];

  userName: string = '';
  partnerId: string = '';

  // Reviews data
  allReviews: Review[] = [];
  filteredReviews: Review[] = [];
  services: Service[] = [];
  selectedService: string = 'all';

  // Rating statistics
  averageRating: number = 0;
  totalReviews: number = 0;
  ratingDistribution: RatingDistribution[] = [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 }
  ];

  // Increase from last month
  ratingIncrease: number = 0;

  // Response form
  respondingToReview: string | null = null;
  responseText: string = '';

  // Make Math available in template
  Math = Math;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.userName;
      this.partnerId = user.id;
      this.loadReviews();
      this.loadServices();
    } else {
      this.router.navigate(['/partner/login']);
    }
  }

  loadReviews() {
    // Load all reviews for this partner
    this.http.get<any[]>(`/api/userReviews?partnerId=${this.partnerId}`).subscribe({
      next: (reviews) => {
        // Map API response to component interface
        this.allReviews = reviews.map(r => ({
          id: r.id,
          customerId: r.userId,
          customerName: r.customerName || 'Customer',
          customerInitials: r.customerName ? r.customerName.charAt(0).toUpperCase() : 'C',
          serviceId: r.serviceId || r.bookingId,
          serviceName: r.serviceName,
          rating: r.rating,
          comment: r.comment || '',
          date: r.createdAt || r.date,
          partnerResponse: r.partnerResponse,
          responseDate: r.responseDate
        })).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.filteredReviews = [...this.allReviews];
        this.calculateRatingStatistics();
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        // Generate sample reviews if API fails
        this.generateSampleReviews();
      }
    });
  }

  loadServices() {
    // Load partner's services for filter
    this.http.get<any>(`/api/users/${this.partnerId}`).subscribe({
      next: (partner) => {
        // Extract services from partner object
        const servicesList: Service[] = [];
        if (partner.services) {
          Object.keys(partner.services).forEach(category => {
            partner.services[category].forEach((service: any) => {
              servicesList.push({
                id: service.title,
                title: service.title
              });
            });
          });
        }
        this.services = servicesList;
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  calculateRatingStatistics() {
    if (this.allReviews.length === 0) {
      this.averageRating = 0;
      this.totalReviews = 0;
      return;
    }

    // Calculate average rating
    const totalRating = this.allReviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.allReviews.length;
    this.totalReviews = this.allReviews.length;

    // Calculate rating distribution
    const distribution = [0, 0, 0, 0, 0];
    this.allReviews.forEach(review => {
      distribution[5 - review.rating]++;
    });

    this.ratingDistribution = [
      { stars: 5, count: distribution[0], percentage: (distribution[0] / this.totalReviews) * 100 },
      { stars: 4, count: distribution[1], percentage: (distribution[1] / this.totalReviews) * 100 },
      { stars: 3, count: distribution[2], percentage: (distribution[2] / this.totalReviews) * 100 },
      { stars: 2, count: distribution[3], percentage: (distribution[3] / this.totalReviews) * 100 },
      { stars: 1, count: distribution[4], percentage: (distribution[4] / this.totalReviews) * 100 }
    ];

    // Calculate rating increase (mock calculation)
    this.ratingIncrease = 12.8;
  }

  filterReviews() {
    if (this.selectedService === 'all') {
      this.filteredReviews = [...this.allReviews];
    } else {
      this.filteredReviews = this.allReviews.filter(
        review => review.serviceName === this.selectedService
      );
    }
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  startResponse(reviewId: string) {
    this.respondingToReview = reviewId;
    const review = this.allReviews.find(r => r.id === reviewId);
    if (review && review.partnerResponse) {
      this.responseText = review.partnerResponse;
    } else {
      this.responseText = '';
    }
  }

  cancelResponse() {
    this.respondingToReview = null;
    this.responseText = '';
  }

  submitResponse(reviewId: string) {
    if (!this.responseText.trim()) {
      return;
    }

    const review = this.allReviews.find(r => r.id === reviewId);
    if (review) {
      // Update review with response
      const updatedReview = {
        ...review,
        partnerResponse: this.responseText,
        responseDate: new Date().toISOString().split('T')[0]
      };

      this.http.put(`/api/reviews/${reviewId}`, updatedReview).subscribe({
        next: () => {
          // Update local data
          const index = this.allReviews.findIndex(r => r.id === reviewId);
          if (index !== -1) {
            this.allReviews[index] = updatedReview;
          }
          this.filterReviews();
          this.respondingToReview = null;
          this.responseText = '';
        },
        error: (error) => {
          console.error('Error submitting response:', error);
          // Still update locally for demo
          const index = this.allReviews.findIndex(r => r.id === reviewId);
          if (index !== -1) {
            this.allReviews[index] = updatedReview;
          }
          this.filterReviews();
          this.respondingToReview = null;
          this.responseText = '';
        }
      });
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/partner/login']);
  }

  generateSampleReviews() {
    // Sample reviews for demo
    this.allReviews = [
      {
        id: 'REV001',
        customerId: '002',
        customerName: 'Priya Sharma',
        customerInitials: 'PS',
        serviceId: 'SRV001',
        serviceName: 'Bathroom Deep Cleaning',
        rating: 5,
        comment: 'Excellent service! Very thorough and professional. The bathroom looks brand new. Highly recommend!',
        date: '2024-12-20',
        partnerResponse: '',
        responseDate: ''
      },
      {
        id: 'REV002',
        customerId: '003',
        customerName: 'Rahul Mehta',
        customerInitials: 'RM',
        serviceId: 'SRV002',
        serviceName: 'Kitchen Cleaning',
        rating: 5,
        comment: 'Great work! Arrived on time and completed the job efficiently. Very satisfied with the results.',
        date: '2024-10-10',
        partnerResponse: 'Thank you so much for your kind words! It was a pleasure working with you.',
        responseDate: '2024-10-11'
      },
      {
        id: 'REV003',
        customerId: '004',
        customerName: 'Anjali Patel',
        customerInitials: 'AP',
        serviceId: 'SRV003',
        serviceName: 'Full House Cleaning',
        rating: 4,
        comment: 'Good service overall. Did a thorough job but took a bit longer than expected.',
        date: '2024-12-15',
        partnerResponse: '',
        responseDate: ''
      },
      {
        id: 'REV004',
        customerId: '005',
        customerName: 'Vikram Singh',
        customerInitials: 'VS',
        serviceId: 'SRV001',
        serviceName: 'Bathroom Deep Cleaning',
        rating: 5,
        comment: 'Outstanding! Very detail-oriented and left everything spotless. Will definitely book again.',
        date: '2024-12-02',
        partnerResponse: 'I really appreciate your feedback! Looking forward to serving you again.',
        responseDate: '2024-12-03'
      },
      {
        id: 'REV005',
        customerId: '006',
        customerName: 'Neha Gupta',
        customerInitials: 'NG',
        serviceId: 'SRV002',
        serviceName: 'Kitchen Cleaning',
        rating: 3,
        comment: 'Decent work but missed a few spots. Had to point them out for a re-clean.',
        date: '2024-12-25',
        partnerResponse: '',
        responseDate: ''
      }
    ];

    this.filteredReviews = [...this.allReviews];
    this.calculateRatingStatistics();
  }
}
