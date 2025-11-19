import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/user/register']);
  }

  navigateBack(): void {
    this.router.navigate(['/customer']);
  }

  onGoogleLogin(): void {
    // Placeholder for Google OAuth integration
    console.log('Google login clicked');
  }

  onFacebookLogin(): void {
    // Placeholder for Facebook OAuth integration
    console.log('Facebook login clicked');
  }

  onForgotPassword(): void {
    // Navigate to forgot password page (to be implemented)
    console.log('Forgot password clicked');
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          if (response.success && response.user && response.sessionId) {
            // Save session
            this.authService.saveSession(response.sessionId, response.user);
            
            // Redirect to user dashboard/welcome page
            this.router.navigate(['/user/dashboard']);
          } else {
            this.errorMessage = response.message || 'Login failed';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Login failed. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
