import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingState } from './booking.model';

export const selectBookingState = createFeatureSelector<BookingState>('bookings');

export const selectAllBookings = createSelector(
  selectBookingState,
  (state) => state.bookings
);

export const selectFilteredBookings = createSelector(
  selectBookingState,
  (state) => state.filteredBookings
);

export const selectSelectedFilter = createSelector(
  selectBookingState,
  (state) => state.selectedFilter
);

export const selectBookingsLoading = createSelector(
  selectBookingState,
  (state) => state.loading
);

export const selectBookingsError = createSelector(
  selectBookingState,
  (state) => state.error
);

// Count bookings by status
export const selectBookingCounts = createSelector(
  selectAllBookings,
  (bookings) => ({
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    upcoming: bookings.filter(b => b.status === 'Upcoming').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length
  })
);
