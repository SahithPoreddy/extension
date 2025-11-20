import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import * as BookingActions from './booking.actions';
import { AuthService } from '../../services/auth.service';

export class BookingEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  loadBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadBookings),
      switchMap(() => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          return of(BookingActions.loadBookingsFailure({ error: 'User not authenticated' }));
        }

        // Load bookings based on user role
        const filterParam = currentUser.role === 'partner' ? 'partnerId' : 'userId';
        return this.http.get<any[]>(`/api/bookings?${filterParam}=${currentUser.id}`).pipe(
          map((bookings) =>
            BookingActions.loadBookingsSuccess({ bookings })
          ),
          catchError((error) =>
            of(BookingActions.loadBookingsFailure({ error: error.message }))
          )
        );
      })
    )
  );

  updateBookingStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.updateBookingStatus),
      mergeMap(({ bookingId, status }) =>
        this.http.patch<any>(`/api/bookings/${bookingId}`, { status }).pipe(
          map(() =>
            BookingActions.updateBookingStatusSuccess({ bookingId, status })
          ),
          catchError((error) =>
            of(BookingActions.loadBookingsFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
