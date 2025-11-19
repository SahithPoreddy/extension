import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './partner-profile.component.html',
  styleUrls: ['./partner-profile.component.css']
})
export class PartnerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  partnerName: string = '';
  partnerId: string = '';
  serviceAreas: string[] = [];
  newPinCode: string = '';
  profilePictureUrl: string = '';
  selectedFile: File | null = null;
  initialFormValue: any;

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
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPartnerData();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{10,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', [Validators.minLength(50), Validators.maxLength(500)]],
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  loadPartnerData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/partner/login']);
      return;
    }

    this.partnerId = currentUser.id;

    this.http.get<any>(`/api/users/${this.partnerId}`).subscribe({
      next: (partner) => {
        this.partnerName = partner.name;
        this.profilePictureUrl = partner.profilePicture || '';
        this.serviceAreas = partner.serviceAreas || [];

        this.profileForm.patchValue({
          fullName: partner.name || '',
          phoneNumber: partner.phone || '',
          email: partner.email || '',
          bio: partner.bio || '',
          streetAddress: partner.address?.street || '',
          city: partner.address?.city || '',
          state: partner.address?.state || '',
          pincode: partner.address?.pincode || ''
        });

        // Store initial form value for cancel functionality
        this.initialFormValue = this.profileForm.value;
      },
      error: (err) => {
        console.error('Error loading partner data:', err);
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
    fileInput?.click();
  }

  addServiceArea(): void {
    const pinCode = this.newPinCode.trim();
    const pinCodePattern = /^\d{6}$/;

    if (pinCode && pinCodePattern.test(pinCode)) {
      if (!this.serviceAreas.includes(pinCode)) {
        this.serviceAreas.push(pinCode);
        this.newPinCode = '';
      }
    }
  }

  removeServiceArea(pinCode: string): void {
    this.serviceAreas = this.serviceAreas.filter(area => area !== pinCode);
  }

  isFormValid(): boolean {
    return this.profileForm.valid && this.serviceAreas.length > 0;
  }

  saveChanges(): void {
    if (!this.isFormValid()) {
      return;
    }

    const formData = this.profileForm.value;
    const updatedPartner = {
      name: formData.fullName,
      phone: formData.phoneNumber,
      email: formData.email,
      bio: formData.bio,
      address: {
        street: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      serviceAreas: this.serviceAreas,
      profilePicture: this.profilePictureUrl,
      profileCompleted: true
    };

    this.http.patch(`/api/users/${this.partnerId}`, updatedPartner).subscribe({
      next: () => {
        this.router.navigate(['/partner/dashboard']);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
      }
    });
  }

  cancelChanges(): void {
    this.profileForm.patchValue(this.initialFormValue);
    this.serviceAreas = [...this.serviceAreas]; // Reset to loaded state
    this.router.navigate(['/partner/dashboard']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['pattern']) {
      if (fieldName === 'phoneNumber') {
        return 'Please enter a valid phone number (10+ digits)';
      }
      if (fieldName === 'pincode') {
        return 'Please enter a valid 6-digit pincode';
      }
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }

  isPinCodeValid(): boolean {
    const pinCodePattern = /^\d{6}$/;
    return pinCodePattern.test(this.newPinCode.trim());
  }
}
