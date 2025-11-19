import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';

interface FAQCategory {
  title: string;
  icon: string;
  articleCount: number;
  questions: FAQQuestion[];
}

interface FAQQuestion {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent implements OnInit {
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
  searchQuery: string = '';
  contactSubject: string = '';
  contactMessage: string = '';

  faqCategories: FAQCategory[] = [
    {
      title: 'Getting Started',
      icon: 'play_circle',
      articleCount: 8,
      questions: [
        {
          question: 'How do I create my partner profile?',
          answer: 'To create your partner profile, click on "Edit Profile" from the sidebar and fill in all required information including your bio, service areas, and contact details.'
        },
        {
          question: 'How long does profile verification take?',
          answer: 'Profile verification typically takes 24-48 hours. Our team will review your documents and credentials to ensure quality service for our customers.'
        },
        {
          question: 'What documents do I need to provide?',
          answer: 'You need to provide a valid ID proof, address proof, and relevant service certifications or licenses depending on your service category.'
        }
      ]
    },
    {
      title: 'Bookings',
      icon: 'event_note',
      articleCount: 6,
      questions: [
        {
          question: 'How do I accept or decline a booking request?',
          answer: 'Go to the "My Bookings" section, find the pending request, and click either "Accept" or "Decline" button. Make sure to respond within 24 hours.'
        },
        {
          question: 'Can I cancel a confirmed booking?',
          answer: 'Yes, but frequent cancellations may affect your rating. To cancel, go to the booking details and click "Cancel Booking". Provide a valid reason for cancellation.'
        },
        {
          question: 'What happens if a customer cancels?',
          answer: 'If a customer cancels within 24 hours of the booking, you may be eligible for a cancellation fee. The amount will be automatically credited to your account.'
        },
        {
          question: 'How do I mark a service as completed?',
          answer: 'Once you finish the service, go to the booking details and click "Mark as Completed". The customer will be notified to confirm and provide payment.'
        }
      ]
    },
    {
      title: 'Payments',
      icon: 'account_balance_wallet',
      articleCount: 6,
      questions: [
        {
          question: 'When do I receive payment for completed services?',
          answer: 'Payments are credited to your UrbanFix wallet immediately after the customer confirms service completion. You can then request a payout to your bank account.'
        },
        {
          question: 'How do I request a payout?',
          answer: 'Go to the "Earnings" section, click "Request Payout", enter the amount (minimum ₹200), and submit. Payouts are processed within 2-3 business days.'
        },
        {
          question: 'What are the service fees?',
          answer: 'UrbanFix charges a 15% platform fee on each completed booking. This fee covers payment processing, customer support, and platform maintenance.'
        },
        {
          question: 'How do I update my bank details?',
          answer: 'Navigate to the "Earnings" page, scroll to the "Bank Account Details" section, and click "Update Bank Details" to modify your account information.'
        }
      ]
    },
    {
      title: 'Account & Services',
      icon: 'manage_accounts',
      articleCount: 6,
      questions: [
        {
          question: 'How do I add new services?',
          answer: 'Go to "Manage Services", click "Add New Service", select the category, fill in service details including pricing and duration, then click "Save".'
        },
        {
          question: 'Can I change my service prices?',
          answer: 'Yes, you can edit service prices anytime from the "Manage Services" section. Click the edit icon next to the service you want to modify.'
        },
        {
          question: 'How do I improve my rating?',
          answer: 'Maintain high quality service, arrive on time, communicate professionally, and respond promptly to customer queries. Consistently good reviews will improve your overall rating.'
        },
        {
          question: 'What should I do if I receive a negative review?',
          answer: 'Respond professionally to the review, address the customer\'s concerns, and explain any circumstances. Future positive reviews will help balance your overall rating.'
        }
      ]
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.userName;
    } else {
      this.router.navigate(['/partner/login']);
    }
  }

  sendMessage() {
    if (this.contactSubject.trim() && this.contactMessage.trim()) {
      // In a real application, this would send the message to the backend
      alert('Message sent successfully! We will get back to you within 24 hours.');
      this.contactSubject = '';
      this.contactMessage = '';
    }
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
}
