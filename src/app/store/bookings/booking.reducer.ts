import { createReducer, on } from '@ngrx/store';
import { BookingState } from './booking.model';
import * as BookingActions from './booking.actions';

export const initialState: BookingState = {
  bookings: [],
  filteredBookings: [],
  selectedFilter: 'all',
  loading: false,
  error: null
};

export const bookingReducer = createReducer(
  initialState,
  
  // Load bookings
  on(BookingActions.loadBookings, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(BookingActions.loadBookingsSuccess, (state, { bookings }) => ({
    ...state,
    bookings,
    filteredBookings: filterBookings(bookings, state.selectedFilter),
    loading: false
  })),
  
  on(BookingActions.loadBookingsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Set filter
  on(BookingActions.setFilter, (state, { filter }) => ({
    ...state,
    selectedFilter: filter,
    filteredBookings: filterBookings(state.bookings, filter)
  })),
  
  // Update booking status
  on(BookingActions.updateBookingStatusSuccess, (state, { bookingId, status }) => {
    const updatedBookings = state.bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status } : booking
    );
    return {
      ...state,
      bookings: updatedBookings,
      filteredBookings: filterBookings(updatedBookings, state.selectedFilter)
    };
  })
);

// Helper function to filter bookings
function filterBookings(
  bookings: any[],
  filter: 'all' | 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled'
): any[] {
  if (filter === 'all') {
    return bookings;
  }
  return bookings.filter(booking => booking.status === filter);
}
