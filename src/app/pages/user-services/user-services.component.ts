import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Service {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  reviews: number;
  duration: string;
  category: string;
  badge?: string;
}

@Component({
  selector: 'app-user-services',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSliderModule
  ],
  templateUrl: './user-services.component.html',
  styleUrl: './user-services.component.css'
})
export class UserServicesComponent implements OnInit {
  searchQuery = '';
  searchSubject = new Subject<string>();
  
  // Filter options
  priceRange = { min: 0, max: 2000 };
  selectedMinRating = 0;
  selectedCategories: string[] = [];
  sortBy = 'relevance';

  // Filter display
  showFilters = true;

  // Rating options
  ratingOptions = [
    { value: 4.5, label: '4.5 & up' },
    { value: 4, label: '4 & up' },
    { value: 3.5, label: '3.5 & up' },
    { value: 3, label: '3 & up' }
  ];

  // Category options
  categories = [
    { id: 'cleaning', name: 'Cleaning', icon: 'cleaning_services' },
    { id: 'electrical', name: 'Electrical', icon: 'electrical_services' },
    { id: 'plumbing', name: 'Plumbing', icon: 'plumbing' },
    { id: 'painting', name: 'Painting', icon: 'format_paint' },
    { id: 'carpentry', name: 'Carpentry', icon: 'carpenter' },
    { id: 'appliances', name: 'Appliances', icon: 'kitchen' }
  ];

  // All services data
  allServices: Service[] = [
    {
      id: '1',
      name: 'Deep Home Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      price: 475,
      originalPrice: 600,
      discount: '20% OFF',
      rating: 4.8,
      reviews: 2234,
      duration: '2-3 hours',
      category: 'cleaning',
      badge: 'Cleaning'
    },
    {
      id: '2',
      name: 'Bathroom Cleaning',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
      price: 399,
      rating: 4.7,
      reviews: 3501,
      duration: '1 hour',
      category: 'cleaning',
      badge: 'Cleaning'
    },
    {
      id: '3',
      name: 'Kitchen Deep Clean',
      image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400',
      price: 679,
      originalPrice: 899,
      discount: '24% OFF',
      rating: 4.8,
      reviews: 3103,
      duration: '3 hours',
      category: 'cleaning',
      badge: 'Cleaning'
    },
    {
      id: '4',
      name: 'Basic Plumbing Repair',
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
      price: 299,
      rating: 4.5,
      reviews: 4432,
      duration: '1 hour',
      category: 'plumbing',
      badge: 'Plumbing'
    },
    {
      id: '5',
      name: 'Pipe Installation',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
      price: 1199,
      originalPrice: 1500,
      discount: '20% OFF',
      rating: 4.6,
      reviews: 567,
      duration: '1-4 hours',
      category: 'plumbing',
      badge: 'Plumbing'
    },
    {
      id: '6',
      name: 'Electrical Wiring',
      image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
      price: 699,
      rating: 4.7,
      reviews: 739,
      duration: '2-3 hours',
      category: 'electrical',
      badge: 'Electrical'
    },
    {
      id: '7',
      name: 'Switch & Socket Repair',
      image: 'https://images.unsplash.com/photo-1621905252472-3d0e3f7676dc?w=400',
      price: 199,
      originalPrice: 250,
      discount: '20% OFF',
      rating: 4.4,
      reviews: 1436,
      duration: '30 mins',
      category: 'electrical',
      badge: 'Electrical'
    },
    {
      id: '8',
      name: 'Interior Wall Painting',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
      price: 1199,
      rating: 4.8,
      reviews: 3629,
      duration: '1-2 days',
      category: 'painting',
      badge: 'Painting'
    },
    {
      id: '9',
      name: 'Furniture Assembly',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      price: 399,
      originalPrice: 500,
      discount: '20% OFF',
      rating: 4.6,
      reviews: 8191,
      duration: '1-2 hours',
      category: 'carpentry',
      badge: 'Carpentry'
    },
    {
      id: '10',
      name: 'AC Repair & Service',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
      price: 599,
      rating: 4.7,
      reviews: 1723,
      duration: '1-2 hours',
      category: 'appliances',
      badge: 'Appliances'
    },
    {
      id: '11',
      name: 'Washing Machine Repair',
      image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400',
      price: 399,
      rating: 4.5,
      reviews: 5334,
      duration: '1 hour',
      category: 'appliances',
      badge: 'Appliances'
    },
    {
      id: '12',
      name: 'Custom Carpentry Work',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      price: 2499,
      rating: 4.8,
      reviews: 4459,
      duration: '1-3 days',
      category: 'carpentry',
      badge: 'Carpentry'
    }
  ];

  filteredServices: Service[] = [];
  displayedServices: Service[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize filtered services
    this.filteredServices = [...this.allServices];
    this.displayedServices = [...this.allServices];

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.applyFilters();
    });

    // Check for category filter from route params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategories = [params['category']];
        this.applyFilters();
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  onRatingChange(rating: number): void {
    this.selectedMinRating = rating;
    this.applyFilters();
  }

  onCategoryChange(categoryId: string, checked: boolean): void {
    if (checked) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== categoryId);
    }
    this.applyFilters();
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  onSortChange(): void {
    this.applySorting();
  }

  applyFilters(): void {
    let filtered = [...this.allServices];

    // Apply search filter
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(service =>
      service.price >= this.priceRange.min && service.price <= this.priceRange.max
    );

    // Apply rating filter
    if (this.selectedMinRating > 0) {
      filtered = filtered.filter(service => service.rating >= this.selectedMinRating);
    }

    // Apply category filter
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(service =>
        this.selectedCategories.includes(service.category)
      );
    }

    this.filteredServices = filtered;
    this.applySorting();
  }

  applySorting(): void {
    let sorted = [...this.filteredServices];

    switch (this.sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'relevance':
      default:
        // Keep original order or sort by reviews
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    this.displayedServices = sorted;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.priceRange = { min: 0, max: 2000 };
    this.selectedMinRating = 0;
    this.selectedCategories = [];
    this.sortBy = 'relevance';
    this.applyFilters();
  }

  navigateToHome(): void {
    this.router.navigate(['/user/dashboard']);
  }

  viewServiceDetails(serviceId: string): void {
    this.router.navigate(['/user/service', serviceId]);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
