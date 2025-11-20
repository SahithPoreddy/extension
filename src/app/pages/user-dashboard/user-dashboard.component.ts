import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { HttpClient } from '@angular/common/http';
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

  recentBookings: Booking[] = [];

  recommendedServices: Service[] = [];

  popularCategories: Category[] = [];

  allServices: Service[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get user details from auth service
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.userName;
      // Load unread notification count
      this.loadNotificationCount(user.id);
      // Load recent bookings
      this.loadRecentBookings(user.id);
    }

    // Load services and categories from backend
    this.loadServices();
    this.loadCategories();
  }

  loadServices(): void {
    this.http.get<any[]>('/api/services').subscribe({
      next: (services) => {
        // Map services to the Service interface format
        this.recommendedServices = services
          .filter(s => s.active)
          .slice(0, 4)
          .map(service => {
            const averageRating = this.calculateAverageRating(service.ratings || []);
            const originalPrice = service.hasOffer ? Math.round(service.price / (1 - service.offerDiscount / 100)) : undefined;
            
            return {
              id: service.id,
              name: service.title,
              image: service.image || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
              price: service.price,
              originalPrice: originalPrice,
              discount: service.hasOffer ? `${service.offerDiscount}% OFF` : undefined,
              rating: averageRating,
              reviews: service.ratings?.length || 0,
              duration: this.formatDuration(service.duration, service.priceType),
              badge: service.categoryId
            };
          });
        
        // Initialize all services for search
        this.allServices = [...this.recommendedServices];
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.recommendedServices = [];
      }
    });
  }

  loadCategories(): void {
    this.http.get<any[]>('/api/categories').subscribe({
      next: (categories) => {
        this.popularCategories = categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: this.getCategoryIcon(cat.icon)
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.popularCategories = [];
      }
    });
  }

  calculateAverageRating(ratings: any[]): number {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  formatDuration(duration: number, priceType: string): string {
    if (priceType === 'daily') {
      return duration === 1 ? '1 day' : `${duration} days`;
    } else if (priceType === 'hourly') {
      const hours = Math.floor(duration / 60);
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    return `${duration} mins`;
  }

  getCategoryIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'electrical': 'electrical_services',
      'plumbing': 'plumbing',
      'carpentry': 'carpenter',
      'cleaning': 'cleaning_services',
      'painting': 'format_paint'
    };
    return iconMap[iconName.toLowerCase()] || iconName;
  }

  loadRecentBookings(userId: string): void {
    this.http.get<any[]>('/api/bookings').subscribe({
      next: (bookings) => {
        // Filter bookings for current user and get the most recent ones
        const userBookings = bookings
          .filter(b => b.userId === userId)
          .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
          .slice(0, 5);
        
        // Map to the Booking interface format
        this.recentBookings = userBookings.map(booking => ({
          id: booking.id,
          serviceName: booking.serviceName,
          provider: booking.partnerName,
          date: this.formatDate(booking.date),
          status: this.mapStatus(booking.status),
          rating: booking.rating
        }));
      },
      error: (error) => {
        console.error('Error loading recent bookings:', error);
        this.recentBookings = [];
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  mapStatus(status: string): 'completed' | 'upcoming' | 'cancelled' {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'completed';
    if (statusLower === 'cancelled') return 'cancelled';
    return 'upcoming';
  }

  loadNotificationCount(userId: string): void {
    this.http.get<any[]>('/api/notifications').subscribe({
      next: (notifications) => {
        const unreadCount = notifications.filter(
          n => n.userId === userId && !n.isRead
        ).length;
        this.notificationCount = unreadCount;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        // Keep default count on error
      }
    });
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
