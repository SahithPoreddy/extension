import { Injectable } from '@angular/core';

export interface BookingData {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDiscount?: number;
  serviceDuration: string;
  selectedDate?: Date;
  selectedTime?: string;
  selectedAddress?: {
    id: string;
    type: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  };
  additionalInstructions?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingData: BookingData | null = null;

  constructor() { }

  startBooking(serviceId: string, serviceName: string, price: number, duration: string, discount?: number): void {
    this.bookingData = {
      serviceId,
      serviceName,
      servicePrice: price,
      serviceDuration: duration,
      serviceDiscount: discount
    };
  }

  setSchedule(date: Date, time: string): void {
    if (this.bookingData) {
      this.bookingData.selectedDate = date;
      this.bookingData.selectedTime = time;
    }
  }

  setAddress(address: any, instructions?: string): void {
    if (this.bookingData) {
      this.bookingData.selectedAddress = address;
      this.bookingData.additionalInstructions = instructions;
    }
  }

  getBookingData(): BookingData | null {
    return this.bookingData;
  }

  clearBooking(): void {
    this.bookingData = null;
  }

  calculateTotal(): { subtotal: number; discount: number; convenienceFee: number; total: number } {
    if (!this.bookingData) {
      return { subtotal: 0, discount: 0, convenienceFee: 0, total: 0 };
    }

    const subtotal = this.bookingData.servicePrice;
    const discount = this.bookingData.serviceDiscount || 0;
    const convenienceFee = 50;
    const total = subtotal - discount + convenienceFee;

    return { subtotal, discount, convenienceFee, total };
  }
}
