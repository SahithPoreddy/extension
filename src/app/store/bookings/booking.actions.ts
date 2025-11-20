import { createAction, props } from '@ngrx/store';
import { Booking } from './booking.model';

// Load bookings actions
export const loadBookings = createAction(
  '[Bookings] Load Bookings'
);

export const loadBookingsSuccess = createAction(
  '[Bookings] Load Bookings Success',
  props<{ bookings: Booking[] }>()
);

export const loadBookingsFailure = createAction(
  '[Bookings] Load Bookings Failure',
  props<{ error: string }>()
);

// Filter bookings actions
export const setFilter = createAction(
  '[Bookings] Set Filter',
  props<{ filter: 'all' | 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled' }>()
);

// Update booking status action
export const updateBookingStatus = createAction(
  '[Bookings] Update Booking Status',
  props<{ bookingId: string; status: 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled' }>()
);

export const updateBookingStatusSuccess = createAction(
  '[Bookings] Update Booking Status Success',
  props<{ bookingId: string; status: 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled' }>()
);
