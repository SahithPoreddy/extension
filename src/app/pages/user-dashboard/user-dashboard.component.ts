import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';

interface QuickAction {
  icon: string;
  label: string;
  route: string;
}

interface Booking {
  id: string;
  serviceName: string;
  provider: string;
  date: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  rating?: number;
}

interface Service {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  reviews: number;
  duration: string;
  badge?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'support';
  time: string;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  userName = 'User';
  location = 'Mumbai, Maharashtra';
  searchQuery = '';
  searchResults: Service[] = [];
  showSearchResults = false;
  notificationCount = 3;

  // Chat functionality
  isChatOpen = false;
  chatMessages: ChatMessage[] = [
    {
      text: 'Hello! How can I help you today?',
      sender: 'support',
      time: '2:33 PM'
    }
  ];
  chatInput = '';

  quickActions: QuickAction[] = [
    { icon: 'search', label: 'Browse Services', route: '/user/services' },
    { icon: 'calendar_today', label: 'My Bookings', route: '/user/bookings' },
    { icon: 'notifications', label: 'Notifications', route: '/user/notifications' },
    { icon: 'support_agent', label: 'Support', route: '/user/support' }
  ];

  recentBookings: Booking[] = [
    {
      id: '1',
      serviceName: 'Deep Home Cleaning',
      provider: 'John Smith',
      date: 'Jan 15, 2025',
      status: 'completed',
      rating: 5
    },
    {
      id: '2',
      serviceName: 'Plumbing Repair',
      provider: 'Mike Johnson',
      date: 'Jan 20, 2025',
      status: 'upcoming'
    }
  ];

  recommendedServices: Service[] = [
    {
      id: '1',
      name: 'AC Service & Repair',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
      price: 599,
      originalPrice: 999,
      discount: '40% OFF',
      rating: 4.8,
      reviews: 2234,
      duration: '2-3 hours'
    },
    {
      id: '2',
      name: 'Kitchen Deep Cleaning',
      image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400',
      price: 799,
      originalPrice: 1199,
      discount: '33% OFF',
      rating: 4.7,
      reviews: 3103,
      duration: '3 hours',
      badge: 'Cleaning'
    },
    {
      id: '3',
      name: 'Electrical Repairs',
      image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
      price: 299,
      rating: 4.5,
      reviews: 4432,
      duration: '1 hour',
      badge: 'Electrical'
    },
    {
      id: '4',
      name: 'Painting Services',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
      price: 1299,
      rating: 4.6,
      reviews: 1876,
      duration: '1-2 days',
      badge: 'Painting'
    }
  ];

  popularCategories: Category[] = [
    { id: 'cleaning', name: 'Cleaning', icon: 'cleaning_services' },
    { id: 'plumbing', name: 'Plumbing', icon: 'plumbing' },
    { id: 'electrical', name: 'Electrical', icon: 'electrical_services' },
    { id: 'painting', name: 'Painting', icon: 'format_paint' },
    { id: 'carpentry', name: 'Carpentry', icon: 'carpenter' }
  ];

  allServices: Service[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get user details from auth service
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.userName;
    }

    // Initialize all services for search
    this.allServices = [...this.recommendedServices];
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onSearch(): void {
    if (this.searchQuery.trim().length > 0) {
      this.searchResults = this.allServices.filter(service =>
        service.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.showSearchResults = true;
    } else {
      this.searchResults = [];
      this.showSearchResults = false;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  selectService(service: Service): void {
    this.router.navigate(['/user/service', service.id]);
    this.clearSearch();
  }

  viewAllBookings(): void {
    this.router.navigate(['/user/bookings']);
  }

  viewServiceDetails(serviceId: string): void {
    this.router.navigate(['/user/service', serviceId]);
  }

  filterByCategory(categoryId: string): void {
    this.router.navigate(['/user/services'], {
      queryParams: { category: categoryId }
    });
  }

  changeLocation(): void {
    // Placeholder for location change functionality
    console.log('Change location clicked');
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  // Chat functionality
  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (this.chatInput.trim()) {
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      // Add user message
      this.chatMessages.push({
        text: this.chatInput,
        sender: 'user',
        time: currentTime
      });

      // Clear input
      const userMessage = this.chatInput;
      this.chatInput = '';

      // Simulate support response after a short delay
      setTimeout(() => {
        this.chatMessages.push({
          text: 'Thank you for your message. Our support team will assist you shortly.',
          sender: 'support',
          time: currentTime
        });
      }, 1000);
    }
  }

  closeChat(): void {
    this.isChatOpen = false;
  }
}
