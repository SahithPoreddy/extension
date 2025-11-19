import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

interface Transaction {
  id: string;
  type: 'earning' | 'payout';
  title: string;
  from?: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
}

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingPayment: number;
  lastPayout: number;
}

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTabsModule
  ],
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.css']
})
export class EarningsComponent implements OnInit {
  partnerName: string = '';
  partnerId: string = '';
  
  earningsData: EarningsData = {
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayment: 0,
    lastPayout: 0
  };

  transactions: Transaction[] = [];
  payoutHistory: Transaction[] = [];
  
  showPayoutRequest: boolean = false;
  payoutAmount: number = 0;
  
  bankDetails: any = null;

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
    this.loadEarningsData();
  }

  loadEarningsData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/partner/login']);
      return;
    }

    this.partnerId = currentUser.id;
    this.partnerName = currentUser.userName;

    // Load partner data
    this.http.get<any>(`/api/users/${this.partnerId}`).subscribe({
      next: (partner) => {
        this.bankDetails = partner.bankAccount;
      }
    });

    // Load earnings data
    this.http.get<any[]>('/api/earnings').subscribe({
      next: (earnings) => {
        const partnerEarnings = earnings.find(e => e.partnerId === this.partnerId);
        if (partnerEarnings) {
          this.earningsData.totalEarnings = partnerEarnings.totalEarnings || 0;
          this.earningsData.availableBalance = partnerEarnings.availableBalance || 0;
          this.earningsData.pendingPayment = partnerEarnings.pendingPayment || 0;
          this.earningsData.lastPayout = partnerEarnings.lastPayout || 0;
        }
      }
    });

    // Load transactions
    this.http.get<any[]>('/api/transactions').subscribe({
      next: (transactions) => {
        const partnerTransactions = transactions.filter(t => t.partnerId === this.partnerId);
        
        this.transactions = partnerTransactions.map(t => ({
          id: t.id,
          type: t.type,
          title: t.title,
          from: t.from,
          amount: t.amount,
          date: t.date,
          status: t.status
        }));

        this.payoutHistory = this.transactions.filter(t => t.type === 'payout');
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

  togglePayoutRequest(): void {
    this.showPayoutRequest = !this.showPayoutRequest;
    if (!this.showPayoutRequest) {
      this.payoutAmount = 0;
    }
  }

  isPayoutValid(): boolean {
    return this.payoutAmount > 0 && 
           this.payoutAmount <= this.earningsData.availableBalance &&
           this.bankDetails !== null;
  }

  requestPayout(): void {
    if (!this.isPayoutValid()) return;

    // Create payout transaction
    const newTransaction = {
      id: `TXN${Date.now()}`,
      partnerId: this.partnerId,
      type: 'payout',
      title: 'Payout to Bank',
      amount: this.payoutAmount,
      date: new Date().toISOString(),
      status: 'Completed',
      toBankAccount: this.bankDetails
    };

    // Add transaction
    this.http.post('/api/transactions', newTransaction).subscribe({
      next: () => {
        // Update earnings
        this.http.get<any[]>('/api/earnings').subscribe({
          next: (earnings) => {
            const partnerEarningsIndex = earnings.findIndex(e => e.partnerId === this.partnerId);
            
            if (partnerEarningsIndex !== -1) {
              earnings[partnerEarningsIndex].availableBalance -= this.payoutAmount;
              earnings[partnerEarningsIndex].lastPayout = this.payoutAmount;
              
              this.http.put(`/api/earnings/${earnings[partnerEarningsIndex].id}`, earnings[partnerEarningsIndex]).subscribe({
                next: () => {
                  this.showPayoutRequest = false;
                  this.payoutAmount = 0;
                  this.loadEarningsData();
                }
              });
            }
          }
        });
      }
    });
  }

  downloadStatement(): void {
    alert('Downloading earnings statement...');
  }

  updateBankDetails(): void {
    alert('Bank details update functionality would open a modal here');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getTransactionIcon(type: string): string {
    return type === 'earning' ? 'call_received' : 'account_balance';
  }

  getTransactionClass(type: string): string {
    return type === 'earning' ? 'transaction-earning' : 'transaction-payout';
  }

  getStatusClass(status: string): string {
    return status === 'Completed' ? 'status-completed' : 'status-pending';
  }
}
