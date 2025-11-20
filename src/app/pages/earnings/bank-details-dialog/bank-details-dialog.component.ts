import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bank-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './bank-details-dialog.component.html',
  styleUrls: ['./bank-details-dialog.component.css'],
})
export class BankDetailsDialogComponent {
  bankDetailsForm: FormGroup;
  hideAccountNumber = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BankDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bankDetailsForm = this.fb.group({
      accountHolder: [
        data?.accountHolder || '',
        [Validators.required, Validators.minLength(3)],
      ],
      accountNumber: [
        data?.accountNumber || '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{9,18}$'),
          Validators.minLength(9),
          Validators.maxLength(18),
        ],
      ],
      ifsc: [
        data?.ifsc || '',
        [
          Validators.required,
          Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$'),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.bankDetailsForm.valid) {
      this.dialogRef.close(this.bankDetailsForm.value);
    }
  }

  toggleAccountNumberVisibility(): void {
    this.hideAccountNumber = !this.hideAccountNumber;
  }

  getAccountNumberError(): string {
    const control = this.bankDetailsForm.get('accountNumber');
    if (control?.hasError('required')) {
      return 'Account number is required';
    }
    if (control?.hasError('pattern') || control?.hasError('minlength')) {
      return 'Please enter a valid account number (9-18 digits)';
    }
    return '';
  }

  getIfscError(): string {
    const control = this.bankDetailsForm.get('ifsc');
    if (control?.hasError('required')) {
      return 'IFSC code is required';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid IFSC code (e.g., HDFC0001234)';
    }
    return '';
  }

  getAccountHolderError(): string {
    const control = this.bankDetailsForm.get('accountHolder');
    if (control?.hasError('required')) {
      return 'Account holder name is required';
    }
    if (control?.hasError('minlength')) {
      return 'Name must be at least 3 characters long';
    }
    return '';
  }
}
