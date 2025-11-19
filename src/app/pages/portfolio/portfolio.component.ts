import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Inject } from '@angular/core';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

interface PortfolioItem {
  id: string;
  imageUrl: string;
  caption: string;
  uploadedDate: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  partnerName: string = '';
  partnerId: string = '';
  portfolioItems: PortfolioItem[] = [];

  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
    { name: 'Profile', icon: 'person', route: 'profile' },
    { name: 'Manage Services', icon: 'build', route: 'services' },
    { name: 'Portfolio', icon: 'photo_library', route: 'portfolio' },
    { name: 'My Bookings', icon: 'event_note', route: 'bookings', badge: 3 },
    { name: 'Earnings', icon: 'account_balance_wallet', route: 'earnings' },
    { name: 'Reviews', icon: 'star', route: 'reviews' },
    { name: 'Notifications', icon: 'notifications', route: 'notifications', badge: 5 },
    { name: 'Support', icon: 'help', route: 'support' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPartnerData();
  }

  loadPartnerData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/partner/login']);
      return;
    }

    this.partnerId = currentUser.id;
    this.partnerName = currentUser.userName;

    this.http.get<any>(`/api/users/${this.partnerId}`).subscribe({
      next: (partner) => {
        this.portfolioItems = partner.portfolio || [];
      },
      error: (err) => {
        console.error('Error loading portfolio:', err);
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigate(route: string): void {
    this.router.navigate([`/partner/${route}`]);
  }

  logout(): void {
    this.authService.logout();
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadImageDialogComponent, {
      width: '600px',
      data: { partnerId: this.partnerId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartnerData();
      }
    });
  }

  openViewEditDialog(item: PortfolioItem, index: number): void {
    const dialogRef = this.dialog.open(ViewEditImageDialogComponent, {
      width: '700px',
      data: { 
        item: { ...item },
        index: index,
        partnerId: this.partnerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartnerData();
      }
    });
  }
}

// Upload Image Dialog Component
@Component({
  selector: 'app-upload-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Upload Portfolio Image</h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <p class="dialog-subtitle">Add high-quality images of your work to attract more customers</p>

        <form [formGroup]="uploadForm">
          <div class="upload-section">
            <div class="image-preview" (click)="triggerFileInput()">
              @if (previewUrl) {
                <img [src]="previewUrl" alt="Preview" class="preview-image" />
              } @else {
                <div class="preview-placeholder">
                  <mat-icon class="placeholder-icon">add_photo_alternate</mat-icon>
                  <p class="placeholder-text">Click below to select an image</p>
                </div>
              }
            </div>

            <input
              type="file"
              #fileInput
              accept="image/*"
              (change)="onFileSelected($event)"
              style="display: none"
            />

            <button
              type="button"
              mat-raised-button
              class="select-btn"
              (click)="triggerFileInput()"
            >
              <mat-icon>image</mat-icon>
              Select Image
            </button>

            <p class="file-hint">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Caption (Optional)</mat-label>
            <textarea
              matInput
              formControlName="caption"
              rows="3"
              placeholder="Describe this project or what makes it special..."
              maxlength="100"
            ></textarea>
            <mat-hint align="end">{{ uploadForm.get('caption')?.value?.length || 0 }}/100 characters</mat-hint>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close class="cancel-btn">Cancel</button>
        <button 
          mat-raised-button 
          [disabled]="!selectedFile"
          (click)="uploadImage()"
          class="upload-btn"
        >
          <mat-icon>cloud_upload</mat-icon>
          Upload
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem 0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .close-btn {
      margin-right: -12px;
    }

    .dialog-subtitle {
      color: #666;
      font-size: 0.875rem;
      margin: 0 0 1.5rem 0;
    }

    mat-dialog-content {
      padding: 0 1.5rem;
      overflow-y: auto;
    }

    .upload-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .image-preview {
      width: 100%;
      height: 300px;
      border: 2px dashed #e0e0e0;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
      background: #fafafa;
    }

    .image-preview:hover {
      border-color: #1a1a1a;
      background: #f5f7fa;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .preview-placeholder {
      text-align: center;
    }

    .placeholder-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .placeholder-text {
      color: #999;
      margin: 0;
    }

    .select-btn {
      margin-bottom: 0.5rem;
    }

    .file-hint {
      font-size: 0.8rem;
      color: #999;
      margin: 0;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      margin: 0;
    }

    .upload-btn {
      background: #1a1a1a !important;
      color: white !important;
    }

    .upload-btn:disabled {
      background: #e0e0e0 !important;
      color: #999 !important;
    }
  `]
})
export class UploadImageDialogComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<UploadImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      caption: ['', [Validators.maxLength(100)]]
    });
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size <= 5 * 1024 * 1024) { // 5MB max
        this.selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert('File size must be less than 5MB');
      }
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.http.get<any>(`/api/users/${this.data.partnerId}`).subscribe({
      next: (partner) => {
        if (!partner.portfolio) {
          partner.portfolio = [];
        }

        const newItem: PortfolioItem = {
          id: `portfolio-${Date.now()}`,
          imageUrl: this.previewUrl,
          caption: this.uploadForm.value.caption || '',
          uploadedDate: new Date().toISOString().split('T')[0]
        };

        partner.portfolio.push(newItem);

        this.http.patch(`/api/users/${this.data.partnerId}`, { portfolio: partner.portfolio }).subscribe({
          next: () => {
            this.dialogRef.close(true);
          }
        });
      }
    });
  }
}

// View/Edit Image Dialog Component
@Component({
  selector: 'app-view-edit-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>View & Edit Image</h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <p class="dialog-subtitle">Update the caption or delete this image</p>

        <div class="image-display">
          <img [src]="data.item.imageUrl" alt="Portfolio Image" class="portfolio-image" />
        </div>

        <form [formGroup]="editForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Caption (Optional)</mat-label>
            <textarea
              matInput
              formControlName="caption"
              rows="3"
              placeholder="Describe this project or what makes it special..."
              maxlength="100"
            ></textarea>
            <mat-hint align="end">{{ editForm.get('caption')?.value?.length || 0 }}/100 characters</mat-hint>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button color="warn" (click)="deleteImage()" class="delete-btn">
          <mat-icon>delete</mat-icon>
          Delete Image
        </button>
        <div class="actions-right">
          <button mat-stroked-button mat-dialog-close class="cancel-btn">Cancel</button>
          <button 
            mat-raised-button 
            (click)="updateImage()"
            class="update-btn"
          >
            <mat-icon>save</mat-icon>
            Update
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem 0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .close-btn {
      margin-right: -12px;
    }

    .dialog-subtitle {
      color: #666;
      font-size: 0.875rem;
      margin: 0 0 1.5rem 0;
    }

    mat-dialog-content {
      padding: 0 1.5rem;
      overflow-y: auto;
    }

    .image-display {
      width: 100%;
      max-height: 400px;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1.5rem;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .portfolio-image {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: contain;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      margin: 0;
      display: flex;
      justify-content: space-between;
    }

    .actions-right {
      display: flex;
      gap: 0.5rem;
    }

    .delete-btn {
      color: #f44336;
      border-color: #f44336;
    }

    .update-btn {
      background: #1a1a1a !important;
      color: white !important;
    }
  `]
})
export class ViewEditImageDialogComponent implements OnInit {
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ViewEditImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      caption: [this.data.item.caption || '', [Validators.maxLength(100)]]
    });
  }

  updateImage(): void {
    this.http.get<any>(`/api/users/${this.data.partnerId}`).subscribe({
      next: (partner) => {
        if (partner.portfolio && partner.portfolio[this.data.index]) {
          partner.portfolio[this.data.index].caption = this.editForm.value.caption;

          this.http.patch(`/api/users/${this.data.partnerId}`, { portfolio: partner.portfolio }).subscribe({
            next: () => {
              this.dialogRef.close(true);
            }
          });
        }
      }
    });
  }

  deleteImage(): void {
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      this.http.get<any>(`/api/users/${this.data.partnerId}`).subscribe({
        next: (partner) => {
          if (partner.portfolio) {
            partner.portfolio.splice(this.data.index, 1);

            this.http.patch(`/api/users/${this.data.partnerId}`, { portfolio: partner.portfolio }).subscribe({
              next: () => {
                this.dialogRef.close(true);
              }
            });
          }
        }
      });
    }
  }
}
