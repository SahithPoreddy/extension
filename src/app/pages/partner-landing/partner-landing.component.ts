import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Statistic {
  value: string;
  label: string;
  position: { top: string; left: string; right?: string };
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  rating: number;
  text: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-partner-landing',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './partner-landing.component.html',
  styleUrl: './partner-landing.component.css'
})
export class PartnerLandingComponent implements OnInit, OnDestroy {
  currentImageIndex = 0;
  carouselInterval: any;

  carouselImages = [
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop'
  ];

  statistics: Statistic[] = [
    { value: '50K+', label: 'Active Partners', position: { top: '80px', left: '50px' } },
    { value: '100%', label: 'Data Privacy', position: { top: '150px', left: '50px' } },
    { value: '40%', label: 'Avg Earn per Job', position: { top: '220px', left: '', right: '50px' } }
  ];

  overallStats = [
    { value: '50K+', label: 'Active Partners' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '12M+', label: 'Customers Served' },
    { value: '₹25K+', label: 'Avg Monthly Earnings' }
  ];

  howItWorksSteps: Step[] = [
    {
      number: 1,
      title: 'Register & Get Verified',
      description: 'Complete your profile with your skills, experience, PAN & Aadhaar. Add Verify your documents.'
    },
    {
      number: 2,
      title: 'Receive Booking Requests',
      description: 'Get notified when customers in your area request services for your offered skills/set prices.'
    },
    {
      number: 3,
      title: 'Complete Jobs & Get Paid',
      description: 'Provide excellent service, receive customer reviews & get paid directly to your account.'
    }
  ];

  features: Feature[] = [
    {
      icon: 'account_balance_wallet',
      title: 'Flexible Earnings',
      description: 'Set your own rates and services. Receive weekly payouts directly to your bank account.'
    },
    {
      icon: 'people',
      title: 'Ready Customer Base',
      description: 'Access millions of customers actively looking for reliable local service providers nearby.'
    },
    {
      icon: 'insert_chart',
      title: 'Grow Your Business',
      description: 'Build your reputation with customer reviews and ratings to attract more bookings.'
    },
    {
      icon: 'calendar_today',
      title: 'Manage Your Schedule',
      description: 'Block out times when you are unavailable and only accept new jobs when you can.'
    },
    {
      icon: 'verified_user',
      title: 'Insurance Coverage',
      description: 'All coverage are covered by our partner protection plan for peace of mind.'
    },
    {
      icon: 'support_agent',
      title: 'Dedicated Support',
      description: 'We offer customer care you through our dedicated partner support channel.'
    }
  ];

  testimonials: Testimonial[] = [
    {
      rating: 4,
      text: 'UrbanFix gave me the best decision for my business. I was able to easily connect of customers and earn some ₹25 more per month!',
      name: 'Rajesh Sharma',
      role: 'Electrician'
    },
    {
      rating: 5,
      text: 'The platform is so easy to use. I can manage my bookings, pay attention to my job profile, all on one app. Very happy with the service.',
      name: 'Priya Sharma',
      role: 'Beautician'
    },
    {
      rating: 5,
      text: 'I love this flexibility. I book when I work when I want and the payments are super fast. I would refer anything!',
      name: 'Amit Patel',
      role: 'Plumber'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
    }, 1000);
  }

  navigateToLogin(): void {
    this.router.navigate(['/partner/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/partner/register']);
  }

  navigateToCustomer(): void {
    this.router.navigate(['/customer']);
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}
