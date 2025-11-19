import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

interface Booking {
  id: string;
  customerName: string;
  serviceName: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  address: string;
  phoneNumber: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Canceled';
  price: number;
  specialInstructions?: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatTabsModule
  ],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  partnerName: string = '';
  partnerId: string = '';
  allBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchQuery: string = '';
  selectedTab: string = 'All';

  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
    { name: 'Profile', icon: 'person', route: 'profile' },
    { name: 'Manage Services', icon: 'build', route: 'services' },
    { name: 'Portfolio', icon: 'photo_library', route: 'portfolio' },
    { name: 'My Bookings', icon: 'event_note', route: 'bookings', badge: 3 },
    { name: 'Earnings', icon: 'account_balance_wallet', route: 'earnings' },
    { name: 'Reviews', icon: 'star', route: 'reviews' },
    { name: 'Notifications', icon: 'notifications', route: 'notifications', badge: 5 },
    { name: 'Support', icon: 'help', route: 'support' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/partner/login']);
      return;
    }

    this.partnerId = currentUser.id;
    this.partnerName = currentUser.userName;

    // Load bookings from API
    this.http.get<any[]>('/api/bookings').subscribe({
      next: (bookings) => {
        this.allBookings = bookings.filter(b => b.partnerId === this.partnerId);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigate(route: string): void {
    this.router.navigate([`/partner/${route}`]);
  }

  logout(): void {
    this.authService.logout();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTabChange(event: any): void {
    const tabLabels = ['All', 'Pending', 'Upcoming', 'Completed', 'Canceled'];
    this.selectedTab = tabLabels[event.index];
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allBookings];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customerName.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query) ||
        booking.serviceName.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    if (this.selectedTab !== 'All') {
      filtered = filtered.filter(booking => this.matchesTabFilter(booking));
    }

    this.filteredBookings = filtered;
  }

  matchesTabFilter(booking: Booking): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookingDate = new Date(booking.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    switch (this.selectedTab) {
      case 'Pending':
        // Services scheduled two or more days from today
        return daysDiff >= 2 && booking.status === 'Confirmed';
      
      case 'Upcoming':
        // Services scheduled for today and tomorrow
        return (daysDiff === 0 || daysDiff === 1) && (booking.status === 'Confirmed' || booking.status === 'In Progress');
      
      case 'Completed':
        return booking.status === 'Completed';
      
      case 'Canceled':
        return booking.status === 'Canceled';
      
      default:
        return true;
    }
  }

  getTabCount(tabName: string): number {
    return this.allBookings.filter(booking => {
      if (tabName === 'All') return true;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const bookingDate = new Date(booking.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      switch (tabName) {
        case 'Pending':
          return daysDiff >= 2 && booking.status === 'Confirmed';
        case 'Upcoming':
          return (daysDiff === 0 || daysDiff === 1) && (booking.status === 'Confirmed' || booking.status === 'In Progress');
        case 'Completed':
          return booking.status === 'Completed';
        case 'Canceled':
          return booking.status === 'Canceled';
        default:
          return false;
      }
    }).length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'In Progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      case 'Canceled':
        return 'status-canceled';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Pending':
      case 'Confirmed':
        return 'schedule';
      case 'In Progress':
        return 'autorenew';
      case 'Completed':
        return 'check_circle';
      case 'Canceled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  canUpdateStatus(booking: Booking): boolean {
    return booking.status !== 'Completed' && booking.status !== 'Canceled';
  }

  getNextStatus(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'Confirmed':
        return ['In Progress', 'Canceled'];
      case 'In Progress':
        return ['Completed', 'Canceled'];
      default:
        return [];
    }
  }

  updateBookingStatus(booking: Booking, newStatus: string): void {
    const bookingIndex = this.allBookings.findIndex(b => b.id === booking.id);
    
    if (bookingIndex !== -1) {
      // Update in API
      this.http.get<any[]>('/api/bookings').subscribe({
        next: (bookings) => {
          const apiBookingIndex = bookings.findIndex(b => b.id === booking.id);
          
          if (apiBookingIndex !== -1) {
            bookings[apiBookingIndex].status = newStatus;
            
            this.http.put(`/api/bookings/${booking.id}`, bookings[apiBookingIndex]).subscribe({
              next: () => {
                this.allBookings[bookingIndex].status = newStatus as any;
                this.applyFilters();
              }
            });
          }
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day < 10 ? '0' + day : day}, ${month} ${year}`;
  }

  formatTime(timeString: string): string {
    return timeString;
  }
}
