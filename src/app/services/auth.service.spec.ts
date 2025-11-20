import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User, LoginCredentials, LoginResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should return success response when credentials are valid', (done) => {
      const mockUsers: User[] = [
        {
          id: '1',
          userName: 'Test User',
          email: 'test@example.com',
          phoneNumber: 1234567890,
          role: 'customer',
          password: 'password123'
        }
      ];

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe((response: LoginResponse) => {
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user?.email).toBe('test@example.com');
        expect(response.sessionId).toBeDefined();
        done();
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should return error when user is not found', (done) => {
      const mockUsers: User[] = [];

      const credentials: LoginCredentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe((response: LoginResponse) => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Username not found');
        done();
      });

      const req = httpMock.expectOne('/api/users');
      req.flush(mockUsers);
    });

    it('should return error when password is incorrect', (done) => {
      const mockUsers: User[] = [
        {
          id: '1',
          userName: 'Test User',
          email: 'test@example.com',
          phoneNumber: 1234567890,
          role: 'customer',
          password: 'correctpassword'
        }
      ];

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe((response: LoginResponse) => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Incorrect password');
        done();
      });

      const req = httpMock.expectOne('/api/users');
      req.flush(mockUsers);
    });
  });

  describe('logout', () => {
    it('should clear all session data from localStorage', () => {
      localStorage.setItem('sessionId', 'test-session-id');
      localStorage.setItem('userEmail', 'test@example.com');
      localStorage.setItem('userName', 'Test User');
      localStorage.setItem('userRole', 'customer');

      service.logout();

      expect(localStorage.getItem('sessionId')).toBeNull();
      expect(localStorage.getItem('userEmail')).toBeNull();
      expect(localStorage.getItem('userName')).toBeNull();
      expect(localStorage.getItem('userRole')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when sessionId exists', () => {
      localStorage.setItem('sessionId', 'test-session-id');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when sessionId does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should return sessionId from localStorage', () => {
      const sessionId = 'test-session-id';
      localStorage.setItem('sessionId', sessionId);
      expect(service.getSession()).toBe(sessionId);
    });

    it('should return null when no sessionId exists', () => {
      expect(service.getSession()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when all fields exist in localStorage', () => {
      localStorage.setItem('sessionId', 'test-session-id');
      localStorage.setItem('userId', 'user-123');
      localStorage.setItem('userEmail', 'test@example.com');
      localStorage.setItem('userName', 'Test User');
      localStorage.setItem('userRole', 'customer');

      const user = service.getCurrentUser();
      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        userName: 'Test User',
        phoneNumber: 0,
        role: 'customer'
      });
    });

    it('should return null when sessionId does not exist', () => {
      localStorage.setItem('userEmail', 'test@example.com');
      localStorage.setItem('userName', 'Test User');
      
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('saveSession', () => {
    it('should save user data to localStorage', () => {
      const sessionId = 'test-session-id';
      const user: User = {
        id: '1',
        userName: 'Test User',
        email: 'test@example.com',
        phoneNumber: 1234567890,
        role: 'customer'
      };

      service.saveSession(sessionId, user);

      expect(localStorage.getItem('sessionId')).toBe(sessionId);
      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
      expect(localStorage.getItem('userName')).toBe('Test User');
      expect(localStorage.getItem('userRole')).toBe('customer');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', (done) => {
      const mockUsers: User[] = [];
      const registrationData = {
        fullName: 'New User',
        email: 'newuser@example.com',
        phoneNumber: '9876543210',
        password: 'Password@123'
      };

      const newUser: User = {
        id: 'new-user-id',
        userName: 'New User',
        email: 'newuser@example.com',
        phoneNumber: 9876543210,
        role: 'customer',
        password: 'Password@123'
      };

      service.register(registrationData).subscribe((response: LoginResponse) => {
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user?.email).toBe('newuser@example.com');
        expect(response.sessionId).toBeDefined();
        done();
      });

      const getReq = httpMock.expectOne('/api/users');
      expect(getReq.request.method).toBe('GET');
      getReq.flush(mockUsers);

      const postReq = httpMock.expectOne('/api/users');
      expect(postReq.request.method).toBe('POST');
      postReq.flush(newUser);
    });

    it('should return error when email already exists', (done) => {
      const mockUsers: User[] = [
        {
          id: '1',
          userName: 'Existing User',
          email: 'existing@example.com',
          phoneNumber: 1234567890,
          role: 'customer',
          password: 'password123'
        }
      ];

      const registrationData = {
        fullName: 'New User',
        email: 'existing@example.com',
        phoneNumber: '9876543210',
        password: 'Password@123'
      };

      service.register(registrationData).subscribe(
        () => {},
        (error) => {
          expect(error.success).toBe(false);
          expect(error.message).toContain('already registered');
          done();
        }
      );

      const req = httpMock.expectOne('/api/users');
      req.flush(mockUsers);
    });
  });
});
