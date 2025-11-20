import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as BookingActions from '../../store/bookings/booking.actions';
import * as BookingSelectors from '../../store/bookings/booking.selectors';

type BookingStatus = 'All' | 'Upcoming' | 'In Progress' | 'Completed';

interface Booking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  providerName: string;
  status: string;
  amount: number;
  duration: string;
}

@Component({
  selector: 'app-user-bookings',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './user-bookings.component.html',
  styleUrl: './user-bookings.component.css'
})
export class UserBookingsComponent implements OnInit {
  allBookings: Booking[] = [];
  displayedBookings: Booking[] = [];
  selectedStatus: BookingStatus = 'All';
  
  bookings$: Observable<any[]>;
  filteredBookings$: Observable<any[]>;
  bookingCounts$: Observable<any>;
  loading$: Observable<boolean>;
  
  statusFilters: { label: BookingStatus; count: number }[] = [
    { label: 'All', count: 0 },
    { label: 'Upcoming', count: 0 },
    { label: 'In Progress', count: 0 },
    { label: 'Completed', count: 0 }
  ];

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
    this.loading$ = this.store.select(BookingSelectors.selectBookingsLoading);
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/user/login']);
      return;
    }

    // Dispatch action to load bookings
    this.store.dispatch(BookingActions.loadBookings());

    // Subscribe to store for local processing
    this.bookings$.subscribe(bookings => {
      this.allBookings = bookings;
      this.updateStatusCounts();
      this.filterBookings();
    });

    this.bookingCounts$.subscribe(counts => {
      this.statusFilters = [
        { label: 'All', count: counts.all },
        { label: 'Upcoming', count: counts.upcoming },
        { label: 'In Progress', count: counts.confirmed },
        { label: 'Completed', count: counts.completed }
      ];
    });
  }

  loadBookings(): void {
    // Method kept for backward compatibility but now uses NgRx
    this.http.get<any[]>('/api/bookings').subscribe({
      next: (bookings) => {
        // This is now handled by NgRx effects
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        // Use mock data if API fails
        this.allBookings = [
          {
            id: 'BK001',
            serviceName: 'AC Repair & Service',
            date: '2025-01-22',
            time: '3:00 PM',
            providerName: 'Sarah Williams',
            status: 'In Progress',
            amount: 949,
            duration: '2-3 hours'
          },
          {
            id: 'BK002',
            serviceName: 'Salon for Women',
            date: '2025-01-20',
            time: '1:00 PM',
            providerName: 'Emma Davis',
            status: 'In Progress',
            amount: 1499,
            duration: '1-2 hours'
          },
          {
            id: 'BK003',
            serviceName: 'Deep Home Cleaning',
            date: '2025-01-25',
            time: '10:00 AM',
            providerName: 'CleanPro Services',
            status: 'Upcoming',
            amount: 949,
            duration: '2-3 hours'
          },
          {
            id: 'BK004',
            serviceName: 'Plumbing Repair',
            date: '2025-01-15',
            time: '2:00 PM',
            providerName: 'Mike Johnson',
            status: 'Completed',
            amount: 599,
            duration: '1 hour'
          },
          {
            id: 'BK005',
            serviceName: 'Electrical Wiring',
            date: '2025-01-10',
            time: '11:00 AM',
            providerName: 'Tech Solutions',
            status: 'Completed',
            amount: 899,
            duration: '2 hours'
          }
        ];
        this.updateStatusCounts();
        this.filterBookings();
      }
    });
  }

  updateStatusCounts(): void {
    this.statusFilters[0].count = this.allBookings.length;
    this.statusFilters[1].count = this.allBookings.filter(b => b.status === 'Upcoming').length;
    this.statusFilters[2].count = this.allBookings.filter(b => b.status === 'In Progress').length;
    this.statusFilters[3].count = this.allBookings.filter(b => b.status === 'Completed').length;
  }

  selectStatus(status: BookingStatus): void {
    this.selectedStatus = status;
    
    // Map BookingStatus to store filter type
    let filter: 'all' | 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';
    switch (status) {
      case 'All':
        filter = 'all';
        break;
      case 'In Progress':
        filter = 'Confirmed';
        break;
      default:
        filter = status as 'Upcoming' | 'Completed';
    }
    
    // Dispatch action to update filter in store
    this.store.dispatch(BookingActions.setFilter({ filter }));
    this.filterBookings();
  }

  filterBookings(): void {
    // Subscribe to filtered bookings from store
    this.filteredBookings$.subscribe(bookings => {
      this.displayedBookings = bookings;
      
      // Sort by date (newest first)
      this.displayedBookings.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }).unsubscribe();
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Upcoming':
        return 'status-upcoming';
      case 'In Progress':
        return 'status-progress';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
  }

  viewDetails(bookingId: string): void {
    this.router.navigate(['/user/booking', bookingId]);
  }

  navigateBack(): void {
    this.router.navigate(['/user/dashboard']);
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
