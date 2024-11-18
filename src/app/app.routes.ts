import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { HomeComponent } from './core/components/home/home.component';
import {ResetPasswordComponent} from './auth/resetpassword/reset-password.component';

// Redirects for users
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToMain = () => redirectLoggedInTo(['/']); // Adjust to your main route

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectLoggedInToMain } },
    { path: 'register', component: RegisterComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectLoggedInToMain } },
    { path: 'forgot-password', component: ResetPasswordComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectLoggedInToMain } },
    { path: '', component: HomeComponent}
];
