import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BookingService } from '../../services/booking.service';
import { HttpClient } from '@angular/common/http';

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

// Standalone Add Address Dialog Component
@Component({
  selector: 'app-add-address-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2 class="dialog-title">New Address</h2>
          <button mat-icon-button (click)="onCancel()" class="close-button">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="addressForm" class="address-form">
          <div class="form-row">
            <div class="form-field full-width">
              <label>Address Type</label>
              <div class="address-type-buttons">
                <button 
                  type="button"
                  class="type-button"
                  [class.selected]="addressForm.get('type')?.value === 'Home'"
                  (click)="addressForm.patchValue({type: 'Home'})">
                  Home
                </button>
                <button 
                  type="button"
                  class="type-button"
                  [class.selected]="addressForm.get('type')?.value === 'Office'"
                  (click)="addressForm.patchValue({type: 'Office'})">
                  Office
                </button>
                <button 
                  type="button"
                  class="type-button"
                  [class.selected]="addressForm.get('type')?.value === 'Other'"
                  (click)="addressForm.patchValue({type: 'Other'})">
                  Other
                </button>
              </div>
            </div>
          </div>

          <div class="form-field">
            <label>Flat / House No. / Building Name</label>
            <input 
              type="text" 
              formControlName="addressLine1"
              placeholder="e.g., Flat 4B, Sunrise Apartments"
              [class.error]="addressForm.get('addressLine1')?.invalid && addressForm.get('addressLine1')?.touched">
            @if (addressForm.get('addressLine1')?.invalid && addressForm.get('addressLine1')?.touched) {
              <span class="error-message">{{ getErrorMessage('addressLine1') }}</span>
            }
          </div>

          <div class="form-field">
            <label>Street / Area / Locality</label>
            <input 
              type="text" 
              formControlName="addressLine2"
              placeholder="e.g., MG Road, Bandra West"
              [class.error]="addressForm.get('addressLine2')?.invalid && addressForm.get('addressLine2')?.touched">
            @if (addressForm.get('addressLine2')?.invalid && addressForm.get('addressLine2')?.touched) {
              <span class="error-message">{{ getErrorMessage('addressLine2') }}</span>
            }
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Landmark (Optional)</label>
              <input 
                type="text" 
                formControlName="landmark"
                placeholder="e.g., Near Metro Station">
            </div>

            <div class="form-field">
              <label>Pincode</label>
              <input 
                type="text" 
                formControlName="pincode"
                placeholder="e.g., 400001"
                maxlength="6"
                [class.error]="addressForm.get('pincode')?.invalid && addressForm.get('pincode')?.touched">
              @if (addressForm.get('pincode')?.invalid && addressForm.get('pincode')?.touched) {
                <span class="error-message">{{ getErrorMessage('pincode') }}</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>City</label>
              <input 
                type="text" 
                formControlName="city"
                placeholder="e.g., Mumbai"
                [class.error]="addressForm.get('city')?.invalid && addressForm.get('city')?.touched">
              @if (addressForm.get('city')?.invalid && addressForm.get('city')?.touched) {
                <span class="error-message">{{ getErrorMessage('city') }}</span>
              }
            </div>

            <div class="form-field">
              <label>State</label>
              <input 
                type="text" 
                formControlName="state"
                placeholder="e.g., Maharashtra"
                [class.error]="addressForm.get('state')?.invalid && addressForm.get('state')?.touched">
              @if (addressForm.get('state')?.invalid && addressForm.get('state')?.touched) {
                <span class="error-message">{{ getErrorMessage('state') }}</span>
              }
            </div>
          </div>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="onCancel()" class="cancel-button">
              Cancel
            </button>
            <button 
              mat-raised-button 
              type="button"
              [disabled]="!addressForm.valid"
              (click)="onSubmit()"
              class="save-button">
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
      padding: 20px;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    .close-button {
      color: #666;
    }

    .address-form {
      padding: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }

    .form-field input {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-field input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-field input.error {
      border-color: #f44336;
    }

    .error-message {
      display: block;
      color: #f44336;
      font-size: 12px;
      margin-top: 4px;
    }

    .address-type-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .type-button {
      height: 48px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      color: #333;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-button:hover {
      border-color: #ff9800;
    }

    .type-button.selected {
      border-color: #ff9800;
      background: #fff4e6;
      color: #ff9800;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .cancel-button {
      color: #666;
    }

    .save-button {
      background: #1a1a1a;
      color: white;
      height: 44px;
      padding: 0 24px;
    }

    .save-button:hover:not([disabled]) {
      background: #333;
    }

    .save-button[disabled] {
      background: #e0e0e0;
      color: #999;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .address-type-buttons {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AddAddressDialogComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<Address>();

  addressForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      type: ['Home', Validators.required],
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
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid 6-digit pincode';
    }
    return '';
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...this.addressForm.value
      };
      this.save.emit(newAddress);
    }
  }
}

@Component({
  selector: 'app-booking-address',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    AddAddressDialogComponent
  ],
  templateUrl: './booking-address.component.html',
  styleUrl: './booking-address.component.css'
})
export class BookingAddressComponent implements OnInit {
  savedAddresses: Address[] = [];
  selectedAddressId: string | null = null;
  additionalInstructions = '';
  showAddAddressDialog = false;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Check if schedule was selected
    const bookingData = this.bookingService.getBookingData();
    if (!bookingData || !bookingData.selectedDate) {
      this.router.navigate(['/booking/schedule']);
      return;
    }

    this.loadAddresses();
  }

  loadAddresses(): void {
    // Load addresses from API
    this.http.get<any[]>('/api/addresses').subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        // Use mock data if API fails
        this.savedAddresses = [
          {
            id: '1',
            type: 'Home',
            addressLine1: '123 Main St',
            addressLine2: 'Mumbai, Maharashtra 400001',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            isDefault: true
          },
          {
            id: '2',
            type: 'Office',
            addressLine1: '456 Business Park',
            addressLine2: 'Mumbai, Maharashtra 400020',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400020'
          }
        ];
      }
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
  }

  openAddAddressDialog(): void {
    this.showAddAddressDialog = true;
  }

  closeAddAddressDialog(): void {
    this.showAddAddressDialog = false;
  }

  onAddressSaved(newAddress: Address): void {
    // Add new address to the list
    this.savedAddresses.push(newAddress);
    this.selectedAddressId = newAddress.id;
    this.closeAddAddressDialog();

    // Update in backend
    this.http.post('/api/addresses', newAddress).subscribe({
      error: (error) => console.error('Error saving address:', error)
    });
  }

  canContinue(): boolean {
    return this.selectedAddressId !== null;
  }

  continue(): void {
    if (!this.canContinue()) return;

    const selectedAddress = this.savedAddresses.find(a => a.id === this.selectedAddressId);
    if (selectedAddress) {
      this.bookingService.setAddress(selectedAddress, this.additionalInstructions);
      this.router.navigate(['/booking/summary']);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/booking/schedule']);
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
