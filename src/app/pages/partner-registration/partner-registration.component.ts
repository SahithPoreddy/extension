import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RegistrationService, Category, Service } from '../../services/registration.service';

@Component({
  selector: 'app-partner-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatProgressBarModule
  ],
  templateUrl: './partner-registration.component.html',
  styleUrl: './partner-registration.component.css'
})
export class PartnerRegistrationComponent implements OnInit {
  currentStep = 0;
  totalSteps = 3;
  
  basicInfoForm!: FormGroup;
  categoriesForm!: FormGroup;
  servicesForm!: FormGroup;

  categories: Category[] = [];
  selectedCategories: string[] = [];
  categoryServices: { [key: string]: any[] } = {};

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categories = this.registrationService.getCategories();
    this.initializeForms();
  }

  initializeForms(): void {
    // Step 1: Basic Info
    this.basicInfoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Step 2: Categories
    this.categoriesForm = this.fb.group({});
    this.categories.forEach(category => {
      this.categoriesForm.addControl(category.id, this.fb.control(false));
    });

    // Step 3: Services
    this.servicesForm = this.fb.group({});
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLengthValid = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLengthValid;

    return !passwordValid ? {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
        isLengthValid
      }
    } : null;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get progressPercentage(): number {
    return Math.round((this.currentStep / this.totalSteps) * 100);
  }

  get isStep1Valid(): boolean {
    return this.basicInfoForm.valid;
  }

  get isStep2Valid(): boolean {
    return this.selectedCategories.length > 0;
  }

  get isStep3Valid(): boolean {
    return this.selectedCategories.every(catId => 
      this.categoryServices[catId] && this.categoryServices[catId].length > 0
    );
  }

  onCategoryChange(categoryId: string, checked: boolean): void {
    if (checked) {
      this.selectedCategories.push(categoryId);
      if (!this.categoryServices[categoryId]) {
        this.categoryServices[categoryId] = [];
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
      delete this.categoryServices[categoryId];
    }
  }

  addService(categoryId: string): void {
    if (!this.categoryServices[categoryId]) {
      this.categoryServices[categoryId] = [];
    }

    this.categoryServices[categoryId].push({
      title: '',
      description: '',
      pricingType: 'Hourly Rate',
      price: 0,
      duration: 60,
      applyOffer: false,
      offerTitle: '',
      discountPercentage: 0
    });
  }

  removeService(categoryId: string, index: number): void {
    this.categoryServices[categoryId].splice(index, 1);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      if (this.currentStep === 0 && this.isStep1Valid) {
        this.currentStep++;
      } else if (this.currentStep === 1 && this.isStep2Valid) {
        // Initialize services for selected categories
        this.selectedCategories.forEach(catId => {
          if (!this.categoryServices[catId] || this.categoryServices[catId].length === 0) {
            this.addService(catId);
          }
        });
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canGoNext(): boolean {
    if (this.currentStep === 0) return this.isStep1Valid;
    if (this.currentStep === 1) return this.isStep2Valid;
    return false;
  }

  canSubmit(): boolean {
    return this.isStep1Valid && this.isStep2Valid && this.isStep3Valid;
  }

  async submitRegistration(): Promise<void> {
    if (!this.canSubmit()) return;

    const registrationData = {
      fullName: this.basicInfoForm.value.fullName,
      email: this.basicInfoForm.value.email,
      phoneNumber: this.basicInfoForm.value.phoneNumber,
      password: this.basicInfoForm.value.password,
      categories: this.selectedCategories,
      services: this.categoryServices
    };

    this.registrationService.registerPartner(registrationData).subscribe({
      next: (response) => {
        const sessionId = response.sessionId || this.registrationService.generateSessionId();
        this.registrationService.saveSession(sessionId, registrationData.email);
        this.router.navigate(['/partner/dashboard']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
      }
    });
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find(c => c.id === categoryId)?.name || categoryId;
  }

  getCategoryIcon(categoryId: string): string {
    return this.categories.find(c => c.id === categoryId)?.icon || 'build';
  }

  goBack(): void {
    this.router.navigate(['/partner']);
  }
}
