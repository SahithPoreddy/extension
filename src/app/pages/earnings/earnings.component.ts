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
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { BankDetailsDialogComponent } from './bank-details-dialog/bank-details-dialog.component';

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
  partnerData: any = null;
  
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
    private authService: AuthService,
    private dialog: MatDialog
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
        this.partnerData = partner;
        this.bankDetails = partner.bankAccount;
      }
    });

    // Calculate earnings from completed bookings
    this.http.get<any[]>('/api/bookings').subscribe({
      next: (bookings) => {
        const partnerBookings = bookings.filter(b => b.partnerId === this.partnerId);
        
        // Calculate total earnings from completed bookings
        const completedBookings = partnerBookings.filter(b => b.status === 'Completed');
        const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
        
        // Calculate pending payment from confirmed/in-progress bookings
        const pendingBookings = partnerBookings.filter(b => 
          b.status === 'Confirmed' || b.status === 'In Progress'
        );
        const pendingPayment = pendingBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
        
        this.earningsData.totalEarnings = totalEarnings;
        this.earningsData.pendingPayment = pendingPayment;
        
        // Load payout history to calculate available balance
        this.loadPayoutHistory(totalEarnings);
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
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        // Continue even if transactions fail
      }
    });
  }

  loadPayoutHistory(totalEarnings: number): void {
    this.http.get<any[]>('/api/transactions').subscribe({
      next: (transactions) => {
        const partnerPayouts = transactions.filter(t => 
          t.partnerId === this.partnerId && t.type === 'payout' && t.status === 'Completed'
        );
        
        const totalPayouts = partnerPayouts.reduce((sum, t) => sum + (t.amount || 0), 0);
        const lastPayout = partnerPayouts.length > 0 
          ? partnerPayouts[partnerPayouts.length - 1].amount 
          : 0;
        
        this.earningsData.availableBalance = totalEarnings - totalPayouts;
        this.earningsData.lastPayout = lastPayout;
      },
      error: (error) => {
        console.error('Error loading payout history:', error);
        // If no transaction history, all earnings are available
        this.earningsData.availableBalance = totalEarnings;
        this.earningsData.lastPayout = 0;
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

    if (!this.bankDetails) {
      alert('Please add your bank details before requesting a payout.');
      return;
    }

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

    // Add transaction to API
    this.http.post('/api/transactions', newTransaction).subscribe({
      next: () => {
        // Immediately update local state
        this.earningsData.availableBalance -= this.payoutAmount;
        this.earningsData.lastPayout = this.payoutAmount;
        
        // Add to transaction history
        this.transactions.unshift({
          id: newTransaction.id,
          type: 'payout',
          title: newTransaction.title,
          amount: newTransaction.amount,
          date: newTransaction.date,
          status: 'Completed'
        });
        
        // Add to payout history
        this.payoutHistory.unshift({
          id: newTransaction.id,
          type: 'payout',
          title: newTransaction.title,
          amount: newTransaction.amount,
          date: newTransaction.date,
          status: 'Completed'
        });
        
        // Reset form
        this.showPayoutRequest = false;
        this.payoutAmount = 0;
        
        alert(`Payout of ₹${newTransaction.amount} has been processed successfully!`);
      },
      error: (error) => {
        console.error('Error processing payout:', error);
        alert('Failed to process payout. Please try again.');
      }
    });
  }

  downloadStatement(): void {
    alert('Downloading earnings statement...');
  }

  getMaskedAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '';
    const last4 = accountNumber.slice(-4);
    return `****${last4}`;
  }

  updateBankDetails(): void {
    const dialogRef = this.dialog.open(BankDetailsDialogComponent, {
      width: '550px',
      data: this.bankDetails
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update partner data with new bank details
        const updatedPartner = {
          ...this.partnerData,
          bankAccount: result
        };

        // Update bank details via API
        this.http.put(`/api/users/${this.partnerId}`, updatedPartner).subscribe({
          next: (response: any) => {
            this.bankDetails = result;
            this.partnerData = updatedPartner;
            alert('Bank details updated successfully!');
          },
          error: (error) => {
            console.error('Error updating bank details:', error);
            alert('Failed to update bank details. Please try again.');
          }
        });
      }
    });
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
