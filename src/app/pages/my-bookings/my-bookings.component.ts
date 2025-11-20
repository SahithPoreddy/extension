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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as BookingActions from '../../store/bookings/booking.actions';
import * as BookingSelectors from '../../store/bookings/booking.selectors';

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

  bookings$: Observable<any[]>;
  filteredBookings$: Observable<any[]>;
  bookingCounts$: Observable<any>;
  selectedFilter$: Observable<string>;
  loading$: Observable<boolean>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private store: Store
  ) {
    // Initialize observables from store
    this.bookings$ = this.store.select(BookingSelectors.selectAllBookings);
    this.filteredBookings$ = this.store.select(BookingSelectors.selectFilteredBookings);
    this.bookingCounts$ = this.store.select(BookingSelectors.selectBookingCounts);
    this.selectedFilter$ = this.store.select(BookingSelectors.selectSelectedFilter);
    this.loading$ = this.store.select(BookingSelectors.selectBookingsLoading);
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/partner/login']);
      return;
    }

    this.partnerId = currentUser.id;
    this.partnerName = currentUser.userName;

    // Dispatch action to load bookings
    this.store.dispatch(BookingActions.loadBookings());

    // Subscribe to bookings for local processing
    this.filteredBookings$.subscribe(bookings => {
      this.filteredBookings = bookings.map(b => ({
        id: b.id,
        customerName: b.userId,
        serviceName: b.serviceName,
        serviceType: b.duration || '',
        bookingDate: b.date,
        bookingTime: b.time,
        address: this.formatAddress(b.address),
        phoneNumber: b.phoneNumber || 'N/A',
        status: b.status,
        price: b.amount,
        specialInstructions: b.additionalInstructions
      }));
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
    const tabLabels: Array<'all' | 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled'> = 
      ['all', 'Pending', 'Upcoming', 'Completed', 'Cancelled'];
    const filter = tabLabels[event.index];
    
    // Dispatch action to update filter in store
    this.store.dispatch(BookingActions.setFilter({ filter }));
    this.selectedTab = filter === 'all' ? 'All' : filter;
  }

  applyFilters(): void {
    // Search filter is applied locally since NgRx handles status filtering
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      this.filteredBookings = this.filteredBookings.filter(booking => 
        booking.customerName.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query) ||
        booking.serviceName.toLowerCase().includes(query)
      );
    } else {
      // Reset to store filtered bookings
      this.filteredBookings$.subscribe(bookings => {
        this.filteredBookings = bookings.map(b => ({
          id: b.id,
          customerName: b.userId,
          serviceName: b.serviceName,
          serviceType: b.duration || '',
          bookingDate: b.date,
          bookingTime: b.time,
          address: this.formatAddress(b.address),
          phoneNumber: b.phoneNumber || 'N/A',
          status: b.status,
          price: b.amount,
          specialInstructions: b.additionalInstructions
        }));
      }).unsubscribe();
    }
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
                
                // If status changed to Completed, create earning transaction
                if (newStatus === 'Completed') {
                  this.createEarningTransaction(bookings[apiBookingIndex]);
                }
              }
            });
          }
        }
      });
    }
  }

  createEarningTransaction(booking: any): void {
    const transaction = {
      id: 'TXN' + Date.now(),
      partnerId: this.partnerId,
      type: 'earning',
      title: booking.serviceName,
      from: booking.userId,
      amount: booking.amount,
      date: new Date().toISOString(),
      status: 'Completed'
    };

    this.http.post('/api/transactions', transaction).subscribe({
      next: () => {
        console.log('Earning transaction created');
      },
      error: (error) => {
        console.error('Error creating earning transaction:', error);
      }
    });
  }

  formatAddress(address: any): string {
    if (typeof address === 'string') return address;
    if (!address) return 'N/A';
    
    const parts = [];
    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    
    return parts.join(', ') || 'N/A';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day < 10 ? '0' + day : day}, ${month} ${year}`;
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    return timeString;
  }
}
