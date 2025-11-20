import { TestBed } from '@angular/core/testing';
import { BookingService, BookingData } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingService]
    });
    service = TestBed.inject(BookingService);
  });

  afterEach(() => {
    service.clearBooking();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startBooking', () => {
    it('should initialize booking data with service details', () => {
      const serviceId = 'service-123';
      const serviceName = 'Plumbing Service';
      const price = 500;
      const duration = '2 hours';
      const discount = 50;

      service.startBooking(serviceId, serviceName, price, duration, discount);

      const bookingData = service.getBookingData();
      expect(bookingData).toBeTruthy();
      expect(bookingData?.serviceId).toBe(serviceId);
      expect(bookingData?.serviceName).toBe(serviceName);
      expect(bookingData?.servicePrice).toBe(price);
      expect(bookingData?.serviceDuration).toBe(duration);
      expect(bookingData?.serviceDiscount).toBe(discount);
    });

    it('should initialize booking data without discount', () => {
      const serviceId = 'service-456';
      const serviceName = 'Cleaning Service';
      const price = 300;
      const duration = '1 hour';

      service.startBooking(serviceId, serviceName, price, duration);

      const bookingData = service.getBookingData();
      expect(bookingData).toBeTruthy();
      expect(bookingData?.serviceId).toBe(serviceId);
      expect(bookingData?.serviceDiscount).toBeUndefined();
    });
  });

  describe('setSchedule', () => {
    it('should set schedule details in booking data', () => {
      service.startBooking('service-123', 'Test Service', 500, '2 hours');
      
      const testDate = new Date('2025-11-25');
      const testTime = '10:00 AM';

      service.setSchedule(testDate, testTime);

      const bookingData = service.getBookingData();
      expect(bookingData?.selectedDate).toBe(testDate);
      expect(bookingData?.selectedTime).toBe(testTime);
    });

    it('should not set schedule if booking data does not exist', () => {
      const testDate = new Date('2025-11-25');
      const testTime = '10:00 AM';

      service.setSchedule(testDate, testTime);

      const bookingData = service.getBookingData();
      expect(bookingData).toBeNull();
    });
  });

  describe('setAddress', () => {
    it('should set address and instructions in booking data', () => {
      service.startBooking('service-123', 'Test Service', 500, '2 hours');
      
      const testAddress = {
        id: 'addr-1',
        type: 'Home',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        landmark: 'Near Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true
      };
      const instructions = 'Please call before arriving';

      service.setAddress(testAddress, instructions);

      const bookingData = service.getBookingData();
      expect(bookingData?.selectedAddress).toEqual(testAddress);
      expect(bookingData?.additionalInstructions).toBe(instructions);
    });

    it('should set address without instructions', () => {
      service.startBooking('service-123', 'Test Service', 500, '2 hours');
      
      const testAddress = {
        id: 'addr-1',
        type: 'Home',
        addressLine1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      };

      service.setAddress(testAddress);

      const bookingData = service.getBookingData();
      expect(bookingData?.selectedAddress).toEqual(testAddress);
      expect(bookingData?.additionalInstructions).toBeUndefined();
    });

    it('should not set address if booking data does not exist', () => {
      const testAddress = {
        id: 'addr-1',
        type: 'Home',
        addressLine1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      };

      service.setAddress(testAddress);

      const bookingData = service.getBookingData();
      expect(bookingData).toBeNull();
    });
  });

  describe('getBookingData', () => {
    it('should return booking data when it exists', () => {
      service.startBooking('service-123', 'Test Service', 500, '2 hours');
      
      const bookingData = service.getBookingData();
      expect(bookingData).toBeTruthy();
      expect(bookingData?.serviceId).toBe('service-123');
    });

    it('should return null when booking data does not exist', () => {
      const bookingData = service.getBookingData();
      expect(bookingData).toBeNull();
    });
  });

  describe('clearBooking', () => {
    it('should clear booking data', () => {
      service.startBooking('service-123', 'Test Service', 500, '2 hours');
      expect(service.getBookingData()).toBeTruthy();

      service.clearBooking();
      
      const bookingData = service.getBookingData();
      expect(bookingData).toBeNull();
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total with discount', () => {
      service.startBooking('service-123', 'Test Service', 500, '2 hours', 50);

      const result = service.calculateTotal();
      
      expect(result.subtotal).toBe(500);
      expect(result.discount).toBe(50);
      expect(result.convenienceFee).toBe(50);
      expect(result.total).toBe(500); // 500 - 50 + 50 = 500
    });

    it('should calculate total without discount', () => {
      service.startBooking('service-123', 'Test Service', 300, '1 hour');

      const result = service.calculateTotal();
      
      expect(result.subtotal).toBe(300);
      expect(result.discount).toBe(0);
      expect(result.convenienceFee).toBe(50);
      expect(result.total).toBe(350); // 300 - 0 + 50 = 350
    });

    it('should return zero values when booking data does not exist', () => {
      const result = service.calculateTotal();
      
      expect(result.subtotal).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.convenienceFee).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
