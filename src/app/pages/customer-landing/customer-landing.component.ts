import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface CarouselImage {
  url: string;
  alt: string;
}

interface Testimonial {
  id: string;
  rating: number;
  text: string;
  customerName: string;
}

interface Service {
  id: string;
  name: string;
  icon: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-customer-landing',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './customer-landing.component.html',
  styleUrl: './customer-landing.component.css'
})
export class CustomerLandingComponent implements OnInit, OnDestroy {
  currentImageIndex = 0;
  carouselInterval: any;

  carouselImages: CarouselImage[] = [
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop',
      alt: 'Professional cleaning service'
    },
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop',
      alt: 'Home repair service'
    },
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop',
      alt: 'Electrical service'
    }
  ];

  popularServices: Service[] = [
    { id: '1', name: 'Cleaning', icon: 'cleaning_services' },
    { id: '2', name: 'Plumbing', icon: 'plumbing' },
    { id: '3', name: 'Electrical', icon: 'electrical_services' },
    { id: '4', name: 'Painting', icon: 'format_paint' },
    { id: '5', name: 'Carpentry', icon: 'construction' },
    { id: '6', name: 'Appliances', icon: 'kitchen' }
  ];

  features: Feature[] = [
    {
      icon: 'verified',
      title: 'Verified Professionals',
      description: 'All service providers are background-verified'
    },
    {
      icon: 'attach_money',
      title: 'Best Prices',
      description: 'Competitive pricing with transparent quotes'
    },
    {
      icon: 'star',
      title: 'Quality Service',
      description: 'Job done service according to your needs'
    },
    {
      icon: 'schedule',
      title: 'Easy Booking',
      description: 'Book with ease day, round-the-clock anytime'
    }
  ];

  steps: Step[] = [
    {
      number: 1,
      title: 'Select Service',
      description: 'Choose from our wide range of home services'
    },
    {
      number: 2,
      title: 'Book & Schedule',
      description: 'Pick a date and time that works for you'
    },
    {
      number: 3,
      title: 'Relax & Enjoy',
      description: 'Our verified professionals get the job done'
    }
  ];

  testimonials: Testimonial[] = [
    {
      id: '1',
      rating: 5,
      text: 'Excellent service! The professional was punctual and did an amazing job with the cleaning.',
      customerName: 'Customer 1'
    },
    {
      id: '2',
      rating: 5,
      text: 'Excellent service! The professional was punctual and did an amazing job with the cleaning.',
      customerName: 'Customer 2'
    },
    {
      id: '3',
      rating: 5,
      text: 'Excellent service! The professional was punctual and did an amazing job with the cleaning.',
      customerName: 'Customer 3'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.startCarousel();
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextImage();
    }, 3000); // Change every 3 seconds
  }

  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
  }

  previousImage() {
    this.currentImageIndex = 
      (this.currentImageIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  navigateToLogin() {
    this.router.navigate(['/user/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/user/register']);
  }

  navigateToPartner() {
    this.router.navigate(['/partner']);
  }

  selectService(service: Service) {
    // Navigate to service booking page
    console.log('Selected service:', service);
  }
}
