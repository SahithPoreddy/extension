export interface Booking {
  id: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  serviceName: string;
  date: string;
  time: string;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod?: string;
  createdAt?: string;
}

export interface BookingState {
  bookings: Booking[];
  filteredBookings: Booking[];
  selectedFilter: 'all' | 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';
  loading: boolean;
  error: string | null;
}
