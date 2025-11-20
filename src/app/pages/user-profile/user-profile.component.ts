import { Component, OnInit, ViewContainerRef, ComponentRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';

interface Address {
  id: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  route: string;
}


@Component({
  selector: 'app-add-address-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>Add New Address</h2>
          <button class="close-button" (click)="onCancel()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="addressForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-field">
              <label>Address Type <span class="required">*</span></label>
              <select formControlName="type">
                <option value="">Select type</option>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
              @if (getErrorMessage('type')) {
                <div class="error-message">{{ getErrorMessage('type') }}</div>
              }
            </div>

            <div class="form-field">
              <label>Pincode <span class="required">*</span></label>
              <input
                type="text"
                formControlName="pincode"
                placeholder="Enter pincode"
                maxlength="6"
              />
              @if (getErrorMessage('pincode')) {
                <div class="error-message">{{ getErrorMessage('pincode') }}</div>
              }
            </div>
          </div>

          <div class="form-field">
            <label>Address Line 1 <span class="required">*</span></label>
            <input
              type="text"
              formControlName="addressLine1"
              placeholder="House/Flat No., Building Name"
            />
            @if (getErrorMessage('addressLine1')) {
              <div class="error-message">{{ getErrorMessage('addressLine1') }}</div>
            }
          </div>

          <div class="form-field">
            <label>Address Line 2 <span class="required">*</span></label>
            <input
              type="text"
              formControlName="addressLine2"
              placeholder="Street, Area"
            />
            @if (getErrorMessage('addressLine2')) {
              <div class="error-message">{{ getErrorMessage('addressLine2') }}</div>
            }
          </div>

          <div class="form-field">
            <label>Landmark</label>
            <input
              type="text"
              formControlName="landmark"
              placeholder="Nearby landmark (optional)"
            />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>City <span class="required">*</span></label>
              <input
                type="text"
                formControlName="city"
                placeholder="Enter city"
              />
              @if (getErrorMessage('city')) {
                <div class="error-message">{{ getErrorMessage('city') }}</div>
              }
            </div>

            <div class="form-field">
              <label>State <span class="required">*</span></label>
              <input
                type="text"
                formControlName="state"
                placeholder="Enter state"
              />
              @if (getErrorMessage('state')) {
                <div class="error-message">{{ getErrorMessage('state') }}</div>
              }
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" class="cancel-button" (click)="onCancel()">
              Cancel
            </button>
            <button
              type="submit"
              class="save-button"
              [disabled]="!addressForm.valid"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #333;
      margin: 0;
    }

    .close-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .close-button:hover {
      background: #e0e0e0;
    }

    .close-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #666;
    }

    form {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .required {
      color: #f44336;
    }

    input, select {
      padding: 10px 12px;
      font-size: 14px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      outline: none;
      transition: all 0.3s ease;
      background-color: #f8f9fa;
    }

    input:focus, select:focus {
      border-color: #ff9800;
      background-color: white;
    }

    select {
      cursor: pointer;
    }

    .error-message {
      font-size: 12px;
      color: #f44336;
      margin-top: 4px;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .cancel-button, .save-button {
      flex: 1;
      padding: 12px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel-button {
      background: white;
      border: 1px solid #e0e0e0;
      color: #666;
    }

    .cancel-button:hover {
      background: #f5f5f5;
    }

    .save-button {
      background: #ff9800;
      border: none;
      color: white;
    }

    .save-button:hover:not(:disabled) {
      background: #f57c00;
    }

    .save-button:disabled {
      background: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})

class AddAddressDialogComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() addressSaved = new EventEmitter<Address>();
  addressForm!: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      type: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.addressForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (fieldName === 'pincode' && control.hasError('pattern')) {
      return 'Please enter a valid 6-digit pincode';
    }

    return '';
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      const newAddress: Address = {
        id: Date.now().toString(),
        type: this.addressForm.value.type,
        addressLine1: this.addressForm.value.addressLine1,
        addressLine2: this.addressForm.value.addressLine2,
        landmark: this.addressForm.value.landmark,
        city: this.addressForm.value.city,
        state: this.addressForm.value.state,
        pincode: this.addressForm.value.pincode
      };

      this.addressSaved.emit(newAddress);
      this.close.emit();
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}

// Edit Profile Dialog Component
@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>Edit Profile</h2>
          <button class="close-button" (click)="onCancel()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="form-field">
            <label>Full Name <span class="required">*</span></label>
            <input
              type="text"
              formControlName="userName"
              placeholder="Enter your full name"
            />
            @if (getErrorMessage('userName')) {
              <div class="error-message">{{ getErrorMessage('userName') }}</div>
            }
          </div>

          <div class="form-field">
            <label>Email Address <span class="required">*</span></label>
            <input
              type="email"
              formControlName="email"
              placeholder="Enter your email"
            />
            @if (getErrorMessage('email')) {
              <div class="error-message">{{ getErrorMessage('email') }}</div>
            }
          </div>

          <div class="form-field">
            <label>Phone Number <span class="required">*</span></label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="Enter your phone number"
              maxlength="10"
            />
            @if (getErrorMessage('phone')) {
              <div class="error-message">{{ getErrorMessage('phone') }}</div>
            }
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="onCancel()">
              Cancel
            </button>
            <button type="submit" class="btn-save" [disabled]="!profileForm.valid">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #333;
      margin: 0;
    }

    .close-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.3s;
    }

    .close-button:hover {
      background: #e0e0e0;
    }

    form {
      padding: 24px;
    }

    .form-field {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .required {
      color: #dc2626;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #1a237e;
    }

    .error-message {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-cancel,
    .btn-save {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cancel {
      background: white;
      border: 1px solid #ddd;
      color: #666;
    }

    .btn-cancel:hover {
      background: #f5f5f5;
    }

    .btn-save {
      background: #1a237e;
      border: none;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background: #0d1650;
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
class EditProfileDialogComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  profileForm!: FormGroup;
  initialData: any;

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      userName: [this.initialData?.userName || '', [Validators.required, Validators.minLength(3)]],
      email: [this.initialData?.email || '', [Validators.required, Validators.email]],
      phone: [this.initialData?.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (fieldName === 'userName' && control.hasError('minlength')) {
      return 'Name must be at least 3 characters';
    }

    if (fieldName === 'email' && control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (fieldName === 'phone' && control.hasError('pattern')) {
      return 'Please enter a valid 10-digit phone number';
    }

    return '';
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      // Emit the updated profile data
      // This will be handled by parent component
      this.close.emit();
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    AddAddressDialogComponent,
    EditProfileDialogComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  userName = 'Priya Sharma';
  userEmail = 'priya.sharma@example.com';
  userPhone = '+91 98765 43210';
  isVerified = true;
  isPremiumMember = true;
  
  bookingsCount = 24;
  avgRating = 4.8;
  rewardsBalance = 250;

  savedAddresses: Address[] = [];

  quickActions: QuickAction[] = [
    {
      icon: 'credit_card',
      title: 'Payment Methods',
      description: 'Manage cards and wallets',
      route: '/user/payment-methods'
    },
    {
      icon: 'calendar_today',
      title: 'My Bookings',
      description: 'View all service bookings',
      route: '/user/bookings'
    },
    {
      icon: 'help_outline',
      title: 'Help & Support',
      description: 'Get help with your services',
      route: '/user/support'
    }
  ];

  showAddAddressDialog = false;
  showEditProfileDialog = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.userName;
      this.userEmail = user.email;
      // Load user addresses if they exist
      const userData = user as any;
      if (userData.addresses && Array.isArray(userData.addresses)) {
        this.savedAddresses = userData.addresses.map((addr: any, index: number) => ({
          id: (index + 1).toString(),
          type: addr.tag || addr.type || 'Home',
          addressLine1: addr.street || addr.addressLine1 || '',
          addressLine2: `${addr.city}, ${addr.state} ${addr.pincode}`,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode.toString(),
          isDefault: index === 0
        }));
      }
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  editProfile(): void {
    this.showEditProfileDialog = true;
  }

  closeEditProfileDialog(): void {
    this.showEditProfileDialog = false;
  }

  onProfileUpdated(profileData: any): void {
    this.userName = profileData.userName;
    this.userEmail = profileData.email;
    this.closeEditProfileDialog();
  }

  openAddAddressDialog(): void {
    this.showAddAddressDialog = true;
  }

  closeAddAddressDialog(): void {
    this.showAddAddressDialog = false;
  }

  onAddressSaved(address: Address): void {
    this.savedAddresses.push(address);
    this.closeAddAddressDialog();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/user/login']);
  }
}

// Dialog Components - Exported for use in template
export { AddAddressDialogComponent, EditProfileDialogComponent };
