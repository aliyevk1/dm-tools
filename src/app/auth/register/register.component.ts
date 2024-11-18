import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    RouterModule,
    NgIf,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  authService: AuthService = inject(AuthService);
  router = inject(Router);
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9.]+$')]], // Only letters, numbers, and .
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      acceptPolicy: [false, Validators.requiredTrue]
    });

  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const rawForm = this.registerForm.getRawValue();
      this.authService
      .register(rawForm.email, rawForm.username, rawForm.password)
      .subscribe({
        next: () => {
          this.authService.sendEmailVerification().subscribe({
            next: () =>{ this.router.navigateByUrl('/login');},
            error:(err) => {console.log(err);
            }
          });
        },
        error: (err) => {
          this.errorMessage = this.getFriendlyErrorMessage(err.code);
        }
      });
    }
  }

  // Separate function to get user-friendly error messages
  private getFriendlyErrorMessage(errorMessage: string): string {
    switch (errorMessage) {
      case 'auth/email-already-in-use':
        return 'Email already in use. Please use a different email.';
      case 'auth/invalid-email':
        return 'Invalid email address. Please enter a valid email.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/username-already-in-use':
        return 'Username already exists. Please choose a different username.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please register or use a different email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      default:
        return 'An error occurred. Please try again later.';
    }
  }
}
