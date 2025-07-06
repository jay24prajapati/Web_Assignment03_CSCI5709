import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../models/booking';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './booking-confirmation.html',
  styleUrls: ['./booking-confirmation.scss']
})
export class BookingConfirmationComponent implements OnInit, OnDestroy {
  booking: BookingResponse | null = null;
  isLoading = true;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadBookingDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBookingDetails(): void {
    const bookingId = this.route.snapshot.params['bookingId'];
    
    if (!bookingId) {
      this.router.navigate(['/restaurants']);
      return;
    }

    this.bookingService.getBooking(bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          this.booking = booking;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load booking details. Please try again.';
          this.isLoading = false;
        }
      });
  }

  bookAnotherTable(): void {
    this.router.navigate(['/book-table']);
  }

  viewMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }

  goToRestaurants(): void {
    this.router.navigate(['/restaurants']);
  }

  // Utility getters
  get formattedBookingDateTime(): string {
    if (!this.booking) return '';
    return this.bookingService.formatBookingDateTime(this.booking);
  }

  get isUpcoming(): boolean {
    if (!this.booking) return false;
    return this.bookingService.isBookingUpcoming(this.booking);
  }

  get statusClass(): string {
    if (!this.booking) return '';
    
    switch (this.booking.status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  get statusIcon(): string {
    if (!this.booking) return 'info';
    
    switch (this.booking.status) {
      case 'confirmed':
        return 'check_circle';
      case 'pending':
        return 'schedule';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  }
} 