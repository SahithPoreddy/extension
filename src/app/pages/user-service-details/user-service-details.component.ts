import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BookingService } from '../../services/booking.service';

interface Review {
  id: string;
  userName: string;
  userInitials: string;
  date: string;
  rating: number;
  comment: string;
  helpful: number;
}

interface ServiceDetail {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  duration: string;
  description: string;
  whatsIncluded: string[];
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  partnerName: string;
  partnerImage?: string;
  reviews: Review[];
}

@Component({
  selector: 'app-user-service-details',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './user-service-details.component.html',
  styleUrl: './user-service-details.component.css'
})
export class UserServiceDetailsComponent implements OnInit {
  service: ServiceDetail | null = null;
  serviceId: string = '';
  
  // Sample service data - in a real app, this would come from a service
  private servicesData: { [key: string]: ServiceDetail } = {
    '1': {
      id: '1',
      name: 'Deep Home Cleaning',
      category: 'Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      price: 599,
      originalPrice: 799,
      discount: 25,
      rating: 4.8,
      reviewCount: 1234,
      duration: '2-3 hours',
      description: 'Professional deep home cleaning service that covers all areas of your home. Our trained professionals use eco-friendly cleaning products and advanced equipment to ensure a thorough cleaning experience. Perfect for regular maintenance or special occasions.',
      whatsIncluded: [
        'Complete dusting of all surfaces',
        'Floor vacuuming and mopping',
        'Kitchen deep cleaning and sanitization',
        'Bathroom cleaning and disinfection',
        'Window and glass cleaning',
        'Furniture and upholstery dusting'
      ],
      features: [
        {
          icon: 'verified_user',
          title: 'Verified & trained professionals',
          description: 'All cleaners are background checked'
        },
        {
          icon: 'workspace_premium',
          title: 'Satisfaction guarantee',
          description: 'We ensure quality service or money back'
        },
        {
          icon: 'support_agent',
          title: 'On-site service',
          description: 'Service at your convenience'
        },
        {
          icon: 'groups',
          title: '4-5 professionals per booking',
          description: 'Team-based efficient cleaning'
        }
      ],
      partnerName: 'CleanPro Services',
      reviews: [
        {
          id: '1',
          userName: 'Priya Sharma',
          userInitials: 'PS',
          date: 'Jan 20, 2025',
          rating: 5,
          comment: 'Excellent service! The team was professional, punctual, and did an amazing job. My home has never been cleaner. Highly recommend!',
          helpful: 142
        },
        {
          id: '2',
          userName: 'Rahul Mehta',
          userInitials: 'RM',
          date: 'Jan 18, 2025',
          rating: 5,
          comment: 'Very thorough cleaning. They paid attention to every detail and used good quality products. Will definitely book again.',
          helpful: 108
        },
        {
          id: '3',
          userName: 'Anjali Patel',
          userInitials: 'AP',
          date: 'Jan 15, 2025',
          rating: 4,
          comment: 'Good service overall. The cleaning was done well but they arrived 15 minutes late. Otherwise, very satisfied with the work.',
          helpful: 67
        },
        {
          id: '4',
          userName: 'Vikram Singh',
          userInitials: 'VS',
          date: 'Jan 12, 2025',
          rating: 5,
          comment: 'Outstanding! The team transformed my dusty apartment into a sparkling clean home. Worth every penny!',
          helpful: 231
        }
      ]
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.serviceId = params['id'];
      this.loadServiceDetails();
    });
  }

  loadServiceDetails(): void {
    // In a real app, fetch from API
    this.service = this.servicesData[this.serviceId] || null;
  }

  navigateBack(): void {
    this.router.navigate(['/user/services']);
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getRatingDistribution(star: number): number {
    if (!this.service) return 0;
    const total = this.service.reviewCount;
    // Simulated distribution
    const distributions: { [key: number]: number } = {
      5: 925,
      4: 189,
      3: 75,
      2: 32,
      1: 13
    };
    return distributions[star] || 0;
  }

  getRatingPercentage(star: number): number {
    if (!this.service) return 0;
    const count = this.getRatingDistribution(star);
    return (count / this.service.reviewCount) * 100;
  }

  onBookNow(): void {
    if (!this.service) return;
    
    // Calculate discount amount
    const discountAmount = this.service.originalPrice 
      ? this.service.originalPrice - this.service.price 
      : 0;
    
    // Start booking with service details
    this.bookingService.startBooking(
      this.service.id,
      this.service.name,
      this.service.price,
      this.service.duration,
      discountAmount
    );
    
    // Navigate to schedule selection
    this.router.navigate(['/booking/schedule']);
  }

  viewAllReviews(): void {
    // Navigate to all reviews page (optional)
    console.log('View all reviews');
  }
}
