import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Notification {
  id: string;
  userId: string;
  type: string;
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
  selector: 'app-user-notifications',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './user-notifications.component.html',
  styleUrl: './user-notifications.component.css'
})
export class UserNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/user/login']);
      return;
    }

    this.http.get<Notification[]>('/api/notifications').subscribe({
      next: (notifications) => {
        // Filter notifications for current user and sort by timestamp (newest first)
        this.notifications = notifications
          .filter(n => n.userId === currentUser.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
        // Use mock data if API fails
        this.loadMockNotifications(currentUser.id);
      }
    });
  }

  loadMockNotifications(userId: string): void {
    this.notifications = [
      {
        id: 'NOT001',
        userId: userId,
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your booking for Deep Home Cleaning has been confirmed for Jan 25, 2025',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: false,
        icon: 'notifications',
        iconColor: '#ff6b35'
      },
      {
        id: 'NOT002',
        userId: userId,
        type: 'provider',
        title: 'Provider Assigned',
        message: 'John Smith has been assigned to your booking',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        isRead: false,
        icon: 'notifications',
        iconColor: '#ff6b35'
      },
      {
        id: 'NOT003',
        userId: userId,
        type: 'reminder',
        title: 'Service Reminder',
        message: 'Your service is scheduled for tomorrow at 10:00 AM',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
        icon: 'notifications',
        iconColor: '#666'
      },
      {
        id: 'NOT004',
        userId: userId,
        type: 'completed',
        title: 'Service Completed',
        message: 'Your plumbing repair service has been completed',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        isRead: true,
        icon: 'notifications',
        iconColor: '#666'
      }
    ];
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      // If already read, just navigate
      this.handleNotificationClick(notification);
      return;
    }

    // Mark as read
    const updatedNotification = { ...notification, isRead: true };
    this.http.put(`/api/notifications/${notification.id}`, updatedNotification).subscribe({
      next: () => {
        // Update local state
        notification.isRead = true;
        // Navigate if there's an action route
        this.handleNotificationClick(notification);
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
        // Still update locally and navigate
        notification.isRead = true;
        this.handleNotificationClick(notification);
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    if (notification.actionRoute) {
      if (notification.actionId) {
        this.router.navigate([notification.actionRoute, notification.actionId]);
      } else {
        this.router.navigate([notification.actionRoute]);
      }
    }
  }

  markAllAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length === 0) {
      return;
    }

    // Update all unread notifications
    const updates = unreadNotifications.map(notification => {
      const updatedNotification = { ...notification, isRead: true };
      return this.http.put(`/api/notifications/${notification.id}`, updatedNotification).toPromise();
    });

    Promise.all(updates).then(() => {
      // Update local state
      this.notifications.forEach(n => n.isRead = true);
    }).catch(error => {
      console.error('Error marking all as read:', error);
      // Still update locally
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  navigateBack(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
