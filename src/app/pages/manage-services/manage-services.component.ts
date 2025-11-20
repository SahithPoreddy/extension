import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { RegistrationService } from '../../services/registration.service';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

interface Service {
  id?: string;
  title: string;
  category: string;
  description: string;
  pricingType: string;
  price: number;
  duration: number;
  applyOffer: boolean;
  offerTitle?: string;
  discountPercentage?: number;
  isActive: boolean;
}

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  templateUrl: './manage-services.component.html',
  styleUrls: ['./manage-services.component.css']
})
export class ManageServicesComponent implements OnInit {
  partnerName: string = '';
  partnerId: string = '';
  services: Service[] = [];
  categories: any[] = [];

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
    private registrationService: RegistrationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPartnerData();
    this.categories = this.registrationService.getCategories();
  }

  loadPartnerData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/partner/login']);
      return;
    }

    this.partnerId = currentUser.id;
    this.partnerName = currentUser.userName;

    this.http.get<any>(`/api/users/${this.partnerId}`).subscribe({
      next: (partner) => {
        this.loadServices(partner);
      },
      error: (err) => {
        console.error('Error loading partner data:', err);
      }
    });
  }

  loadServices(partner: any): void {
    this.services = [];
    
    if (partner.services) {
      Object.keys(partner.services).forEach(category => {
        partner.services[category].forEach((service: any, index: number) => {
          this.services.push({
            id: `${category}-${index}`,
            title: service.title,
            category: category,
            description: service.description,
            pricingType: service.pricingType,
            price: service.price,
            duration: service.duration,
            applyOffer: service.applyOffer || false,
            offerTitle: service.offerTitle || '',
            discountPercentage: service.discountPercentage || 0,
            isActive: service.isActive !== undefined ? service.isActive : true
          });
        });
      });
    }
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

  openAddServiceDialog(): void {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '600px',
      data: { 
        mode: 'add',
        categories: this.categories,
        partnerId: this.partnerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartnerData();
      }
    });
  }

  openEditServiceDialog(service: Service): void {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '600px',
      data: { 
        mode: 'edit',
        service: { ...service },
        categories: this.categories,
        partnerId: this.partnerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartnerData();
      }
    });
  }

  openDeleteConfirmDialog(service: Service): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: { serviceName: service.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteService(service);
      }
    });
  }

  toggleServiceStatus(service: Service): void {
    service.isActive = !service.isActive;
    this.updateServiceInDatabase(service);
  }

  deleteService(service: Service): void {
    this.http.get<any>(`/api/users/${this.partnerId}`).subscribe({
      next: (partner) => {
        const [category, indexStr] = service.id!.split('-');
        const index = parseInt(indexStr);

        if (partner.services && partner.services[category]) {
          partner.services[category].splice(index, 1);
          
          if (partner.services[category].length === 0) {
            delete partner.services[category];
          }

          this.http.patch(`/api/users/${this.partnerId}`, { services: partner.services }).subscribe({
            next: () => {
              this.loadPartnerData();
            }
          });
        }
      }
    });
  }

  updateServiceInDatabase(service: Service): void {
    this.http.get<any>(`/api/users/${this.partnerId}`).subscribe({
      next: (partner) => {
        const [category, indexStr] = service.id!.split('-');
        const index = parseInt(indexStr);

        if (partner.services && partner.services[category] && partner.services[category][index]) {
          partner.services[category][index].isActive = service.isActive;

          this.http.patch(`/api/users/${this.partnerId}`, { services: partner.services }).subscribe();
        }
      }
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  getDiscountedPrice(service: Service): number {
    if (service.applyOffer && service.discountPercentage) {
      return service.price - (service.price * service.discountPercentage / 100);
    }
    return service.price;
  }
}

// Service Dialog Component (Add/Edit)
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add New Service' : 'Edit Service' }}</h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <p class="dialog-subtitle">
          {{ data.mode === 'add' ? 'Add a new service to your offerings' : 'Update your service details' }}
        </p>

        <form [formGroup]="serviceForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Service Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g., Bathroom Deep Cleaning" required />
            @if (getErrorMessage('title')) {
              <mat-error>{{ getErrorMessage('title') }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category" required>
              @for (cat of data.categories; track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
            @if (getErrorMessage('category')) {
              <mat-error>{{ getErrorMessage('category') }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea 
              matInput 
              formControlName="description" 
              rows="3"
              placeholder="Describe what's included in this service..."
              required
            ></textarea>
            @if (getErrorMessage('description')) {
              <mat-error>{{ getErrorMessage('description') }}</mat-error>
            }
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-col">
              <mat-label>Pricing Type</mat-label>
              <mat-select formControlName="pricingType" required>
                <mat-option value="Fixed Price">Fixed Price</mat-option>
                <mat-option value="Hourly Rate">Hourly Rate</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-col">
              <mat-label>Price (₹)</mat-label>
              <input matInput type="number" formControlName="price" placeholder="899" required />
              @if (getErrorMessage('price')) {
                <mat-error>{{ getErrorMessage('price') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-col">
              <mat-label>Duration (mins)</mat-label>
              <input matInput type="number" formControlName="duration" placeholder="90" required />
              @if (getErrorMessage('duration')) {
                <mat-error>{{ getErrorMessage('duration') }}</mat-error>
              }
            </mat-form-field>
          </div>

          @if (serviceForm.value.price && offerEnabled) {
            <div class="price-preview">
              <span class="original-price">₹{{ serviceForm.value.price }}</span>
              @if (serviceForm.value.discountPercentage) {
                <span class="discounted-price">
                  ₹{{ getDiscountedPrice() }} ({{ serviceForm.value.discountPercentage }}% off)
                </span>
              }
            </div>
          }

          <div class="offer-section">
            <div class="offer-toggle">
              <mat-slide-toggle formControlName="applyOffer" (change)="onOfferToggle()">
                Apply Offer
              </mat-slide-toggle>
              <span class="offer-hint">Enable special pricing for this service</span>
            </div>

            @if (offerEnabled) {
              <div class="offer-fields">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Offer Title</mat-label>
                  <input matInput formControlName="offerTitle" placeholder="Summer Special" />
                  @if (getErrorMessage('offerTitle')) {
                    <mat-error>{{ getErrorMessage('offerTitle') }}</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Discount Percentage (%)</mat-label>
                  <input matInput type="number" formControlName="discountPercentage" placeholder="20" />
                  @if (getErrorMessage('discountPercentage')) {
                    <mat-error>{{ getErrorMessage('discountPercentage') }}</mat-error>
                  }
                </mat-form-field>
              </div>
            }
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close class="cancel-btn">Cancel</button>
        <button 
          mat-raised-button 
          [disabled]="!serviceForm.valid"
          (click)="saveService()"
          class="save-btn"
        >
          <mat-icon>{{ data.mode === 'add' ? 'add' : 'save' }}</mat-icon>
          {{ data.mode === 'add' ? 'Add Service' : 'Update Service' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem 0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .close-btn {
      margin-right: -12px;
    }

    .dialog-subtitle {
      color: #666;
      font-size: 0.875rem;
      margin: 0 0 1rem 0;
    }

    mat-dialog-content {
      padding: 0 1.5rem;
      overflow-y: auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-col {
      width: 100%;
    }

    .price-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .original-price {
      font-size: 1rem;
      color: #999;
      text-decoration: line-through;
    }

    .discounted-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #4caf50;
    }

    .offer-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .offer-toggle {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .offer-hint {
      font-size: 0.8rem;
      color: #666;
      margin-left: 0;
    }

    .offer-fields {
      margin-top: 1rem;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      margin: 0;
    }

    .save-btn {
      background: #1a1a1a !important;
      color: white !important;
    }

    .save-btn:disabled {
      background: #e0e0e0 !important;
      color: #999 !important;
    }
  `]
})
export class ServiceDialogComponent implements OnInit {
  serviceForm!: FormGroup;
  offerEnabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.data.mode === 'edit' && this.data.service) {
      this.serviceForm.patchValue(this.data.service);
      this.offerEnabled = this.data.service.applyOffer;
    }
  }

  initializeForm(): void {
    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      pricingType: ['Fixed Price', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      duration: ['', [Validators.required, Validators.min(1)]],
      applyOffer: [false],
      offerTitle: [''],
      discountPercentage: [0]
    });
  }

  onOfferToggle(): void {
    this.offerEnabled = this.serviceForm.value.applyOffer;
    
    if (this.offerEnabled) {
      this.serviceForm.get('offerTitle')?.setValidators([Validators.required]);
      this.serviceForm.get('discountPercentage')?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
    } else {
      this.serviceForm.get('offerTitle')?.clearValidators();
      this.serviceForm.get('discountPercentage')?.clearValidators();
      this.serviceForm.patchValue({ offerTitle: '', discountPercentage: 0 });
    }
    
    this.serviceForm.get('offerTitle')?.updateValueAndValidity();
    this.serviceForm.get('discountPercentage')?.updateValueAndValidity();
  }

  getDiscountedPrice(): number {
    const price = this.serviceForm.value.price;
    const discount = this.serviceForm.value.discountPercentage;
    return Math.round(price - (price * discount / 100));
  }

  saveService(): void {
    if (!this.serviceForm.valid) return;

    this.http.get<any>(`/api/users/${this.data.partnerId}`).subscribe({
      next: (partner) => {
        const category = this.serviceForm.value.category;
        const serviceData = {
          title: this.serviceForm.value.title,
          description: this.serviceForm.value.description,
          pricingType: this.serviceForm.value.pricingType,
          price: this.serviceForm.value.price,
          duration: this.serviceForm.value.duration,
          applyOffer: this.serviceForm.value.applyOffer,
          offerTitle: this.serviceForm.value.offerTitle || '',
          discountPercentage: this.serviceForm.value.discountPercentage || 0,
          isActive: true
        };

        if (!partner.services) {
          partner.services = {};
        }

        if (this.data.mode === 'add') {
          // Add to partner's services
          if (!partner.services[category]) {
            partner.services[category] = [];
          }
          partner.services[category].push(serviceData);

          // Also add to global services array
          const globalService = {
            id: Date.now().toString(),
            partnerId: this.data.partnerId,
            title: serviceData.title,
            categoryId: category,
            priceType: serviceData.pricingType,
            price: serviceData.price,
            duration: serviceData.duration,
            hasOffer: serviceData.applyOffer,
            offerTitle: serviceData.offerTitle,
            offerDiscount: serviceData.discountPercentage,
            active: true,
            ratings: []
          };

          this.http.post('/api/services', globalService).subscribe({
            next: () => {
              // Update partner's services in their profile
              this.http.patch(`/api/users/${this.data.partnerId}`, { services: partner.services }).subscribe({
                next: () => {
                  this.dialogRef.close(true);
                }
              });
            },
            error: (error) => {
              console.error('Error saving to global services:', error);
              // Still update partner's services even if global save fails
              this.http.patch(`/api/users/${this.data.partnerId}`, { services: partner.services }).subscribe({
                next: () => {
                  this.dialogRef.close(true);
                }
              });
            }
          });
        } else {
          // Edit mode
          const [oldCategory, indexStr] = this.data.service.id.split('-');
          const index = parseInt(indexStr);

          if (oldCategory === category) {
            partner.services[category][index] = { ...partner.services[category][index], ...serviceData };
          } else {
            partner.services[oldCategory].splice(index, 1);
            if (partner.services[oldCategory].length === 0) {
              delete partner.services[oldCategory];
            }
            if (!partner.services[category]) {
              partner.services[category] = [];
            }
            partner.services[category].push(serviceData);
          }

          // Update partner's services
          this.http.patch(`/api/users/${this.data.partnerId}`, { services: partner.services }).subscribe({
            next: () => {
              this.dialogRef.close(true);
            }
          });
        }
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.serviceForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
    
    return '';
  }
}

// Delete Confirmation Dialog
@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon">
        <mat-icon>warning</mat-icon>
      </div>
      <h2 mat-dialog-title>Delete Service?</h2>
      <mat-dialog-content>
        <p>Are you sure you want to delete <strong>{{ data.serviceName }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <button mat-stroked-button [mat-dialog-close]="false">Cancel</button>
        <button mat-raised-button color="warn" [mat-dialog-close]="true">Delete</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      text-align: center;
      padding: 1rem;
    }

    .confirm-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 1rem;
      background: #fff3cd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .confirm-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #ff9800;
    }

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }

    mat-dialog-content p {
      margin: 0.5rem 0;
      color: #666;
    }

    .warning-text {
      font-size: 0.875rem;
      color: #f44336;
    }

    mat-dialog-actions {
      gap: 1rem;
      padding: 1.5rem 0 0;
    }
  `]
})
export class DeleteConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
