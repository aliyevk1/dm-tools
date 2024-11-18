import { Component, inject } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule, MatCardSubtitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [
    MatCardModule,
    MatCardSubtitle,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatError,
    MatLabel,
    NgIf
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  authService: AuthService = inject(AuthService);
  snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const { email } = this.resetPasswordForm.value;
      this.authService.sendPasswordResetEmail(email).subscribe({
        next: () => {
          this.snackBar.open('Password reset email has been sent.', 'Close', {
            duration: 3000
          });
        },
        error: (err) => {
          const message = this.getFriendlyErrorMessage(err.code);
          this.snackBar.open(message, 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  private getFriendlyErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please check and try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An error occurred. Please try again later.';
    }
  }
}
