import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-registration',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^\d{10}$/),
        this.numericValidator
      ]],
      password: ['', [
        Validators.required,
        this.passwordValidator
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      agreeToTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator for numeric input
  numericValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const isNumeric = /^\d+$/.test(control.value);
    return isNumeric ? null : { numeric: true };
  }

  // Custom validator for password strength
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    return passwordValid ? null : {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar
      }
    };
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registrationForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (fieldName === 'fullName' && control.hasError('maxlength')) {
      return 'Name cannot exceed 50 characters';
    }

    if (fieldName === 'email' && control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (fieldName === 'phoneNumber') {
      if (control.hasError('pattern') || control.hasError('numeric')) {
        return 'Please enter a valid 10-digit phone number';
      }
    }

    if (fieldName === 'password' && control.hasError('passwordStrength')) {
      const errors = control.errors['passwordStrength'];
      const missing = [];
      if (!errors.hasUpperCase) missing.push('uppercase letter');
      if (!errors.hasLowerCase) missing.push('lowercase letter');
      if (!errors.hasNumber) missing.push('number');
      if (!errors.hasSpecialChar) missing.push('special character');
      return `Password must contain at least one ${missing.join(', ')}`;
    }

    if (fieldName === 'confirmPassword' && this.registrationForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }

  navigateToLogin(): void {
    this.router.navigate(['/user/login']);
  }

  navigateBack(): void {
    this.router.navigate(['/customer']);
  }

  onSubmit(): void {
    if (this.registrationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.registrationForm.value;
      const registrationData = {
        fullName: formValue.fullName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        password: formValue.password
      };

      this.authService.register(registrationData).subscribe({
        next: (response) => {
          if (response.success) {
            // Redirect to login page after successful registration
            this.router.navigate(['/user/login'], {
              queryParams: { registered: 'true' }
            });
          }
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.isSubmitting = false;
          // Handle error (you can show an error message to the user)
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
    }
  }
}
