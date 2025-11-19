import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth.service';

interface Notification {
  id: string;
  partnerId: string;
  type: 'booking' | 'payment' | 'review' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
  actionRoute?: string;
  actionId?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTabsModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
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

  allNotifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  unreadCount: number = 0;

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
      this.loadNotifications();
    } else {
      this.router.navigate(['/partner/login']);
    }
  }

  loadNotifications() {
    this.http.get<Notification[]>(`/api/notifications?partnerId=${this.partnerId}`).subscribe({
      next: (notifications) => {
        this.allNotifications = notifications.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.unreadNotifications = this.allNotifications.filter(n => !n.isRead);
        this.unreadCount = this.unreadNotifications.length;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.generateSampleNotifications();
      }
    });
  }

  markAsRead(notificationId: string) {
    const notification = this.allNotifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      
      // Update on server
      this.http.patch(`/api/notifications/${notificationId}`, { isRead: true }).subscribe({
        error: (error) => console.error('Error updating notification:', error)
      });

      // Update local counts
      this.unreadNotifications = this.allNotifications.filter(n => !n.isRead);
      this.unreadCount = this.unreadNotifications.length;
    }
  }

  markAllAsRead() {
    this.allNotifications.forEach(n => {
      if (!n.isRead) {
        n.isRead = true;
        this.http.patch(`/api/notifications/${n.id}`, { isRead: true }).subscribe({
          error: (error) => console.error('Error updating notification:', error)
        });
      }
    });

    this.unreadNotifications = [];
    this.unreadCount = 0;
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification.id);
    
    if (notification.actionRoute) {
      if (notification.actionId) {
        this.router.navigate([notification.actionRoute], { 
          queryParams: { id: notification.actionId }
        });
      } else {
        this.router.navigate([notification.actionRoute]);
      }
    }
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return notificationTime.toLocaleDateString();
  }

  getNotificationTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'booking': 'Booking Updates',
      'payment': 'Payments & Payouts',
      'review': 'Reviews & Ratings',
      'message': 'Messages',
      'system': 'System Updates'
    };
    return labels[type] || type;
  }

  getNotificationTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'booking': 'event_note',
      'payment': 'account_balance_wallet',
      'review': 'star',
      'message': 'message',
      'system': 'info'
    };
    return icons[type] || 'notifications';
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

  generateSampleNotifications() {
    this.allNotifications = [
      {
        id: 'NOT001',
        partnerId: '001',
        type: 'booking',
        title: 'New Booking Request',
        message: 'Priya Sharma requested Bathroom Deep Cleaning for Jan 25, 10:30 AM',
        timestamp: '2025-01-20T09:15:00',
        isRead: false,
        icon: 'event_note',
        iconColor: '#2196f3',
        actionRoute: '/partner/bookings',
        actionId: 'BK001'
      },
      {
        id: 'NOT002',
        partnerId: '001',
        type: 'payment',
        title: 'Payment Received',
        message: '₹1,299 has been credited to your account for Kitchen Cleaning service',
        timestamp: '2025-01-19T14:30:00',
        isRead: false,
        icon: 'account_balance_wallet',
        iconColor: '#4caf50',
        actionRoute: '/partner/earnings'
      },
      {
        id: 'NOT003',
        partnerId: '001',
        type: 'review',
        title: 'New Review Received',
        message: 'Rahul Mehta rated you 5 stars for Kitchen Cleaning',
        timestamp: '2025-01-19T10:45:00',
        isRead: false,
        icon: 'star',
        iconColor: '#ffc107',
        actionRoute: '/partner/reviews'
      },
      {
        id: 'NOT004',
        partnerId: '001',
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your booking with Anjali Patel for Jan 24, 11:00 AM has been confirmed',
        timestamp: '2025-01-19T08:00:00',
        isRead: true,
        icon: 'event_note',
        iconColor: '#2196f3',
        actionRoute: '/partner/bookings',
        actionId: 'BK003'
      },
      {
        id: 'NOT005',
        partnerId: '001',
        type: 'payment',
        title: 'Payout Processed',
        message: '₹5,000 has been transferred to your bank account ending in 1234',
        timestamp: '2025-01-18T16:20:00',
        isRead: true,
        icon: 'account_balance',
        iconColor: '#4caf50',
        actionRoute: '/partner/earnings'
      },
      {
        id: 'NOT006',
        partnerId: '001',
        type: 'system',
        title: 'Profile Update Required',
        message: 'Please update your service areas to receive more booking requests',
        timestamp: '2025-01-18T12:00:00',
        isRead: true,
        icon: 'info',
        iconColor: '#9e9e9e',
        actionRoute: '/partner/profile'
      },
      {
        id: 'NOT007',
        partnerId: '001',
        type: 'message',
        title: 'New Message',
        message: 'Vikram Singh sent you a message about the upcoming booking',
        timestamp: '2025-01-17T18:30:00',
        isRead: true,
        icon: 'message',
        iconColor: '#9c27b0',
        actionRoute: '/partner/bookings'
      },
      {
        id: 'NOT008',
        partnerId: '001',
        type: 'booking',
        title: 'Booking Cancelled',
        message: 'Neha Gupta has cancelled the booking scheduled for Jan 15',
        timestamp: '2025-01-17T09:15:00',
        isRead: true,
        icon: 'event_busy',
        iconColor: '#f44336',
        actionRoute: '/partner/bookings',
        actionId: 'BK005'
      }
    ];

    this.unreadNotifications = this.allNotifications.filter(n => !n.isRead);
    this.unreadCount = this.unreadNotifications.length;
  }
}
