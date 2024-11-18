import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router'; // For navigation (login/register links)
import { NgIf, CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    RouterModule, // Required for routerLink
    NgIf,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  loginForm: FormGroup;
  authService: AuthService = inject(AuthService);
  router = inject(Router);
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const rawForm = this.loginForm.getRawValue();
      this.authService
        .login(rawForm.email, rawForm.password)
        .subscribe({
          next: () => {
            this.router.navigateByUrl('/');
          },
          error: (err) => {
            this.errorMessage = this.getFriendlyErrorMessage(err.code);
          },
        });
    }
  }

  // Separate function to get user-friendly error messages
  private getFriendlyErrorMessage(errorMessage: string): string {
    switch (errorMessage) {
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please try again.';
      default:
        return 'An error occurred. Please try again later.';
    }
  }
}
