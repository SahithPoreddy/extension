import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface ContactMethod {
  icon: string;
  title: string;
  subtitle: string;
  iconColor: string;
}

interface FAQ {
  question: string;
  answer: string;
  isExpanded: boolean;
}

@Component({
  selector: 'app-user-support',
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './user-support.component.html',
  styleUrl: './user-support.component.css'
})
export class UserSupportComponent {
  messageSubject = '';
  messageText = '';

  contactMethods: ContactMethod[] = [
    {
      icon: 'phone',
      title: 'Call Us',
      subtitle: '1800-123-4567',
      iconColor: '#ff6b35'
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      subtitle: 'Available 24x7',
      iconColor: '#ff6b35'
    },
    {
      icon: 'help_outline',
      title: 'Help Center',
      subtitle: 'Browse FAQs',
      iconColor: '#ff6b35'
    }
  ];

  faqs: FAQ[] = [
    {
      question: 'How do I reschedule a booking?',
      answer: 'You can reschedule your booking from the booking details page up to 2 hours before the scheduled time.',
      isExpanded: false
    },
    {
      question: 'What is the cancellation policy?',
      answer: 'Free cancellation up to 24 hours before the service. After that, a cancellation fee may apply.',
      isExpanded: false
    },
    {
      question: 'How do I get a refund?',
      answer: 'Refunds are processed within 5-7 business days to your original payment method.',
      isExpanded: false
    }
  ];

  constructor(private router: Router) {}

  navigateBack(): void {
    this.router.navigate(['/user/dashboard']);
  }

  toggleFAQ(faq: FAQ): void {
    faq.isExpanded = !faq.isExpanded;
  }

  sendMessage(): void {
    if (this.messageSubject.trim() && this.messageText.trim()) {
      alert('Thank you for contacting us! We will get back to you soon.');
      this.messageSubject = '';
      this.messageText = '';
    }
  }

  canSendMessage(): boolean {
    return this.messageSubject.trim().length > 0 && this.messageText.trim().length > 0;
  }
}
