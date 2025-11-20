import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  userName: string;
  email: string;
  phoneNumber: number;
  role: string;
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  sessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        // Find user by email
        const user = users.find(u => u.email === credentials.email);

        if (!user) {
          return {
            success: false,
            message: 'Username not found'
          };
        }

        // Check password (in real app, this would be hashed comparison)
        // For now, we'll compare directly from the JSON
        // Note: In production, passwords should never be stored in plain text
        if (user.password !== credentials.password) {
          return {
            success: false,
            message: 'Incorrect password'
          };
        }

        // Generate session ID
        const sessionId = uuidv4();

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;

        return {
          success: true,
          user: userWithoutPassword,
          sessionId
        };
      }),
      catchError(error => {
        return throwError(() => ({
          success: false,
          message: 'Login failed. Please try again.'
        }));
      })
    );
  }

  saveSession(sessionId: string, user: User): void {
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.userName);
    localStorage.setItem('userRole', user.role);
  }

  getSession(): string | null {
    return localStorage.getItem('sessionId');
  }

  getCurrentUser(): User | null {
    const sessionId = this.getSession();
    if (!sessionId) return null;

    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');

    if (!userId || !email || !userName || !role) return null;

    return {
      id: userId,
      email,
      userName,
      phoneNumber: 0, // Not stored in session
      role
    };
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  logout(): void {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  }

  getAuthHeaders(): HttpHeaders {
    const sessionId = this.getSession();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': sessionId ? `Bearer ${sessionId}` : ''
    });
  }

  // Registration method
  register(registrationData: { fullName: string, email: string, phoneNumber: string, password: string }): Observable<LoginResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      switchMap(users => {
        // Check if email already exists
        const existingUser = users.find(u => u.email === registrationData.email);
        
        if (existingUser) {
          throw new Error('Email already registered');
        }

        // Generate a new user ID
        const newUserId = uuidv4();
        
        // Create new user object
        const newUser: User = {
          id: newUserId,
          userName: registrationData.fullName,
          email: registrationData.email,
          phoneNumber: parseInt(registrationData.phoneNumber),
          role: 'customer',
          password: registrationData.password // In production, this should be hashed
        };

        // Save the new user to the JSON file using POST request
        return this.http.post<User>(`${this.apiUrl}/users`, newUser);
      }),
      map(newUser => {
        // Generate session ID for the new user
        const sessionId = uuidv4();
        
        // Save session
        this.saveSession(sessionId, newUser);

        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;

        return {
          success: true,
          user: userWithoutPassword,
          sessionId,
          message: 'Registration successful'
        };
      }),
      catchError(error => {
        return throwError(() => ({
          success: false,
          message: error.message || 'Registration failed. Please try again.'
        }));
      })
    );
  }
}
