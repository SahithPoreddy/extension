import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface ProfileSection {
  name: string;
  label: string;
  completed: boolean;
  icon: string;
  route?: string;
  action?: string;
}

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

interface QuickAction {
  icon: string;
  label: string;
  action: string;
}

interface Statistic {
  value: string | number;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-partner-dashboard',
  imports: [
    CommonModule, 
    RouterModule,
    MatIconModule, 
    MatButtonModule, 
    MatProgressBarModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.css',
  standalone: true
})
export class PartnerDashboardComponent implements OnInit {
  partnerName: string = '';
  currentRoute: string = 'dashboard';
  
  profileSections: ProfileSection[] = [
    { 
      name: 'basicProfile', 
      label: 'Basic Profile', 
      completed: true, 
      icon: 'person',
      action: 'profile'
    },
    { 
      name: 'services', 
      label: 'Services', 
      completed: false, 
      icon: 'build',
      route: '/partner/services',
      action: 'Manage Services'
    },
    { 
      name: 'portfolio', 
      label: 'Portfolio', 
      completed: false, 
      icon: 'photo_library',
      route: '/partner/portfolio',
      action: 'Add Photos'
    }
  ];

  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
    { name: 'Profile', icon: 'person', route: 'profile' },
    { name: 'Manage Services', icon: 'build', route: 'services' },
    { name: 'Portfolio', icon: 'photo_library', route: 'portfolio' },
    { name: 'My Bookings', icon: 'calendar_today', route: 'bookings', badge: 3 },
    { name: 'Earnings', icon: 'account_balance_wallet', route: 'earnings' },
    { name: 'Reviews', icon: 'star', route: 'reviews' },
    { name: 'Notifications', icon: 'notifications', route: 'notifications', badge: 5 },
    { name: 'Support', icon: 'help', route: 'support' }
  ];

  quickActions: QuickAction[] = [
    { icon: 'add', label: 'Add New Service', action: 'addService' },
    { icon: 'photo_camera', label: 'Upload Portfolio Images', action: 'uploadPhotos' },
    { icon: 'edit', label: 'Update Profile Information', action: 'updateProfile' }
  ];

  gettingStartedTips = [
    { 
      number: 1, 
      text: 'Complete your profile with accurate information to build trust with customers.' 
    },
    { 
      number: 2, 
      text: 'Add at least 3-5 services with competitive pricing to attract more bookings.' 
    },
    { 
      number: 3, 
      text: 'Upload high-quality photos of your work to showcase your skills and quality.' 
    }
  ];

  statistics: Statistic[] = [
    { value: 0, label: 'Total Bookings', icon: 'event' },
    { value: 2, label: 'Services Listed', icon: 'build_circle' },
    { value: '₹0', label: 'Total Earnings', icon: 'payments' },
    { value: '0.0★', label: 'Average Rating', icon: 'star' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPartnerData();
    this.calculateProfileCompletion();
  }

  loadPartnerData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loadPartnerStatistics(user.id);
    } else {
      this.router.navigate(['/partner/login']);
    }
  }

  loadPartnerStatistics(userId: string): void {
    // Fetch partner data from API
    this.http.get<any>(`/api/users/${userId}`).subscribe({
      next: (partner) => {
        // Always update partner name from API to ensure it's set correctly
        this.partnerName = partner.userName || partner.name || 'Partner';
        
        // Update statistics based on partner data
        if (partner.services) {
          const servicesCount = Object.values(partner.services).reduce(
            (total: number, services: any) => total + services.length, 
            0
          );
          this.statistics[1].value = servicesCount;
        }

        // Update profile sections based on actual data
        this.profileSections[1].completed = partner.services && 
          Object.keys(partner.services).length > 0;
        
        // Check portfolio completion from the same partner data
        this.profileSections[2].completed = partner.portfolio && partner.portfolio.length > 0;
        
        this.calculateProfileCompletion();
      },
      error: (error) => {
        console.error('Error loading partner data:', error);
      }
    });
  }

  calculateProfileCompletion(): void {
    const completedSections = this.profileSections.filter(s => s.completed).length;
    const totalSections = this.profileSections.length;
    this.profileCompletionPercentage = Math.round((completedSections / totalSections) * 100);
  }

  get profileCompletionPercentage(): number {
    const completedSections = this.profileSections.filter(s => s.completed).length;
    return Math.round((completedSections / this.profileSections.length) * 100);
  }

  set profileCompletionPercentage(value: number) {
    // Setter for template binding
  }

  get completedSectionsCount(): number {
    return this.profileSections.filter(s => s.completed).length;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  navigate(route: string): void {
    this.currentRoute = route;
    this.router.navigate([`/partner/${route}`]);
  }

  handleProfileAction(section: ProfileSection): void {
    if (section.route) {
      this.router.navigate([section.route]);
    } else if (section.action) {
      // Handle specific actions
      console.log('Action:', section.action);
    }
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'addService':
        this.router.navigate(['/partner/services'], { queryParams: { action: 'new' } });
        break;
      case 'uploadPhotos':
        this.router.navigate(['/partner/portfolio']);
        break;
      case 'updateProfile':
        this.router.navigate(['/partner/profile']);
        break;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/partner/login']);
  }
}
