import { Routes } from '@angular/router';
import { PartnerLandingComponent } from './pages/partner-landing/partner-landing.component';
import { CustomerLandingComponent } from './pages/customer-landing/customer-landing.component';
import { PartnerRegistrationComponent } from './pages/partner-registration/partner-registration.component';
import { PartnerDashboardComponent } from './pages/partner-dashboard/partner-dashboard.component';
import { PartnerLoginComponent } from './pages/partner-login/partner-login.component';
import { PartnerProfileComponent } from './pages/partner-profile/partner-profile.component';
import { ManageServicesComponent } from './pages/manage-services/manage-services.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { EarningsComponent } from './pages/earnings/earnings.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { SupportComponent } from './pages/support/support.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { UserLoginComponent } from './pages/user-login/user-login.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { UserServicesComponent } from './pages/user-services/user-services.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UserServiceDetailsComponent } from './pages/user-service-details/user-service-details.component';
import { BookingScheduleComponent } from './pages/booking-schedule/booking-schedule.component';
import { BookingAddressComponent } from './pages/booking-address/booking-address.component';
import { BookingSummaryComponent } from './pages/booking-summary/booking-summary.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { BookingConfirmationComponent } from './pages/booking-confirmation/booking-confirmation.component';
import { UserBookingsComponent } from './pages/user-bookings/user-bookings.component';
import { BookingDetailsComponent } from './pages/booking-details/booking-details.component';
import { UserNotificationsComponent } from './pages/user-notifications/user-notifications.component';
import { UserSupportComponent } from './pages/user-support/user-support.component';
import { partnerGuard } from './guards/partner.guard';
import { userGuard } from './guards/user.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/partner', pathMatch: 'full' },
  
  // Partner routes
  { path: 'partner', component: PartnerLandingComponent },
  { path: 'partner/login', component: PartnerLoginComponent },
  { path: 'partner/register', component: PartnerRegistrationComponent },
  {
    path: 'partner',
    canActivate: [partnerGuard],
    children: [
      { path: 'dashboard', component: PartnerDashboardComponent },
      { path: 'profile', component: PartnerProfileComponent },
      { path: 'services', component: ManageServicesComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'bookings', component: MyBookingsComponent },
      { path: 'earnings', component: EarningsComponent },
      { path: 'reviews', component: ReviewsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'support', component: SupportComponent }
    ]
  },

  // Customer landing
  { path: 'customer', component: CustomerLandingComponent },

  // User routes
  { path: 'user/register', component: UserRegistrationComponent },
  { path: 'user/login', component: UserLoginComponent },
  {
    path: 'user',
    canActivate: [userGuard],
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'services', component: UserServicesComponent },
      { path: 'service/:id', component: UserServiceDetailsComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'bookings', component: UserBookingsComponent },
      { path: 'booking/:id', component: BookingDetailsComponent },
      { path: 'notifications', component: UserNotificationsComponent },
      { path: 'support', component: UserSupportComponent }
    ]
  },

  // Booking flow routes (protected by user guard)
  {
    path: 'booking',
    canActivate: [userGuard],
    children: [
      { path: 'schedule', component: BookingScheduleComponent },
      { path: 'address', component: BookingAddressComponent },
      { path: 'summary', component: BookingSummaryComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'confirmation/:id', component: BookingConfirmationComponent }
    ]
  }
];
