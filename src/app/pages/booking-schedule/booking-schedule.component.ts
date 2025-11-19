import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BookingService } from '../../services/booking.service';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-booking-schedule',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './booking-schedule.component.html',
  styleUrl: './booking-schedule.component.css'
})
export class BookingScheduleComponent implements OnInit {
  currentDate = new Date();
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  
  calendarDays: CalendarDay[] = [];
  currentMonth: number;
  currentYear: number;
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
  dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  timeSlots = [
    { time: '08:00 AM', value: '08:00' },
    { time: '09:00 AM', value: '09:00' },
    { time: '10:00 AM', value: '10:00' },
    { time: '11:00 AM', value: '11:00' },
    { time: '12:00 PM', value: '12:00' },
    { time: '01:00 PM', value: '13:00' },
    { time: '02:00 PM', value: '14:00' },
    { time: '03:00 PM', value: '15:00' },
    { time: '04:00 PM', value: '16:00' },
    { time: '05:00 PM', value: '17:00' },
    { time: '06:00 PM', value: '18:00' },
    { time: '07:00 PM', value: '19:00' }
  ];

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    // Check if booking was started
    const bookingData = this.bookingService.getBookingData();
    if (!bookingData) {
      this.router.navigate(['/user/services']);
      return;
    }

    this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);
    
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const nextDays = 7 - lastDayIndex - 1;

    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth, -i + 1);
      this.calendarDays.push({
        date,
        day: prevLastDay.getDate() - i + 1,
        isCurrentMonth: false,
        isToday: false,
        isPast: this.isPastDate(date),
        isSelected: false
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const isToday = this.isToday(date);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday,
        isPast: this.isPastDate(date),
        isSelected: this.selectedDate ? this.isSameDate(date, this.selectedDate) : false
      });
    }

    // Next month days
    for (let i = 1; i <= nextDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isPast: false,
        isSelected: false
      });
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  selectDate(day: CalendarDay): void {
    if (day.isPast || !day.isCurrentMonth) return;
    
    this.selectedDate = day.date;
    this.generateCalendar();
  }

  selectTime(slot: any): void {
    // Check if time is in the past for today's date
    if (this.selectedDate && this.isToday(this.selectedDate)) {
      const now = new Date();
      const selectedHour = parseInt(slot.value.split(':')[0]);
      if (selectedHour <= now.getHours()) {
        return; // Don't allow past times for today
      }
    }
    
    this.selectedTime = slot.time;
  }

  isTimeDisabled(slot: any): boolean {
    if (!this.selectedDate) return false;
    
    if (this.isToday(this.selectedDate)) {
      const now = new Date();
      const selectedHour = parseInt(slot.value.split(':')[0]);
      return selectedHour <= now.getHours();
    }
    
    return false;
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  canContinue(): boolean {
    return this.selectedDate !== null && this.selectedTime !== null;
  }

  continue(): void {
    if (!this.canContinue() || !this.selectedDate || !this.selectedTime) return;
    
    this.bookingService.setSchedule(this.selectedDate, this.selectedTime);
    this.router.navigate(['/booking/address']);
  }

  navigateBack(): void {
    this.router.navigate(['/user/services']);
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
