import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegistrationService, Category, PartnerRegistration } from './registration.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistrationService]
    });
    service = TestBed.inject(RegistrationService);
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

  describe('getCategories', () => {
    it('should return array of categories', () => {
      const categories = service.getCategories();
      
      expect(categories).toBeTruthy();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should return categories with correct structure', () => {
      const categories = service.getCategories();
      
      const firstCategory = categories[0];
      expect(firstCategory.id).toBeDefined();
      expect(firstCategory.name).toBeDefined();
      expect(firstCategory.icon).toBeDefined();
    });

    it('should include plumbing category', () => {
      const categories = service.getCategories();
      
      const plumbing = categories.find(cat => cat.id === 'plumbing');
      expect(plumbing).toBeDefined();
      expect(plumbing?.name).toBe('Plumbing');
      expect(plumbing?.icon).toBe('plumbing');
    });

    it('should include cleaning category', () => {
      const categories = service.getCategories();
      
      const cleaning = categories.find(cat => cat.id === 'cleaning');
      expect(cleaning).toBeDefined();
      expect(cleaning?.name).toBe('Cleaning');
    });

    it('should include all 8 categories', () => {
      const categories = service.getCategories();
      expect(categories.length).toBe(8);
    });
  });

  describe('generateSessionId', () => {
    it('should generate a session ID', () => {
      const sessionId = service.generateSessionId();
      
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it('should generate unique session IDs', () => {
      const sessionId1 = service.generateSessionId();
      const sessionId2 = service.generateSessionId();
      
      expect(sessionId1).not.toBe(sessionId2);
    });

    it('should generate valid UUID v4 format', () => {
      const sessionId = service.generateSessionId();
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(sessionId).toMatch(uuidV4Regex);
    });
  });

  describe('registerPartner', () => {
    it('should successfully register a partner', (done) => {
      const registrationData: PartnerRegistration = {
        fullName: 'Test Partner',
        email: 'partner@example.com',
        phoneNumber: '9876543210',
        password: 'Password@123',
        categories: ['plumbing', 'electrical'],
        services: {
          plumbing: [
            {
              title: 'Pipe Repair',
              description: 'Fix leaking pipes',
              pricingType: 'Hourly Rate',
              price: 500,
              duration: 60,
              applyOffer: false
            }
          ]
        }
      };

      const mockResponse = {
        id: 'partner-1',
        ...registrationData,
        role: 'partner',
        createdAt: new Date().toISOString()
      };

      service.registerPartner(registrationData).subscribe((response) => {
        expect(response).toBeTruthy();
        expect(response.email).toBe('partner@example.com');
        done();
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.role).toBe('partner');
      expect(req.request.body.fullName).toBe('Test Partner');
      expect(req.request.body.email).toBe('partner@example.com');
      expect(req.request.headers.has('Authorization')).toBe(true);
      
      req.flush(mockResponse);
    });

    it('should include role as partner in registration data', (done) => {
      const registrationData: PartnerRegistration = {
        fullName: 'Test Partner',
        email: 'partner@example.com',
        phoneNumber: '9876543210',
        password: 'Password@123',
        categories: ['cleaning'],
        services: {}
      };

      service.registerPartner(registrationData).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.body.role).toBe('partner');
      
      req.flush({});
    });

    it('should include createdAt timestamp in registration data', (done) => {
      const registrationData: PartnerRegistration = {
        fullName: 'Test Partner',
        email: 'partner@example.com',
        phoneNumber: '9876543210',
        password: 'Password@123',
        categories: ['beauty'],
        services: {}
      };

      service.registerPartner(registrationData).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.body.createdAt).toBeDefined();
      expect(typeof req.request.body.createdAt).toBe('string');
      
      req.flush({});
    });
  });

  describe('saveSession', () => {
    it('should save session data to localStorage', () => {
      const sessionId = 'test-session-123';
      const email = 'partner@example.com';

      service.saveSession(sessionId, email);

      expect(localStorage.getItem('sessionId')).toBe(sessionId);
      expect(localStorage.getItem('userEmail')).toBe(email);
      expect(localStorage.getItem('userRole')).toBe('partner');
    });
  });

  describe('getSession', () => {
    it('should return sessionId from localStorage', () => {
      const sessionId = 'test-session-123';
      localStorage.setItem('sessionId', sessionId);

      const result = service.getSession();
      expect(result).toBe(sessionId);
    });

    it('should return null when no session exists', () => {
      const result = service.getSession();
      expect(result).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear all session data from localStorage', () => {
      localStorage.setItem('sessionId', 'test-session-123');
      localStorage.setItem('userEmail', 'partner@example.com');
      localStorage.setItem('userRole', 'partner');

      service.clearSession();

      expect(localStorage.getItem('sessionId')).toBeNull();
      expect(localStorage.getItem('userEmail')).toBeNull();
      expect(localStorage.getItem('userRole')).toBeNull();
    });
  });
});
