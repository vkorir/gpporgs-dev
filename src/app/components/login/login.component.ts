import { Component, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  user
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private provider = new GoogleAuthProvider();

  user$ = user(this.auth);
  isLoading = true;

  constructor() {
    onAuthStateChanged(this.auth, (_user) => {
      if (_user) {
        this.authService.updateLastAccess(_user.email);
        this.router.navigate(['dashboard']);
      }
      this.isLoading = false;
    });
    getRedirectResult(this.auth)
      .then((result) => this.authService.updateUser(result))
      .catch((error) => this.handleError(error));
  }

  login() {
    this.isLoading = true;
    setTimeout(() => signInWithRedirect(this.auth, this.provider), 700);
  }

  private handleError(error: any) {
    let message = 'An error occurred';
    if (error.message && error.message.includes('INVALID_ARGUMENT')) {
      message = 'Invalid email argument';
    } else if (error.message && error.message.includes('PERMISSION_DENIED')) {
      message = 'Use your berkeley.edu account';
    } else if (error.message && error.message.includes('NOT_FOUND')) {
      message = "You don't have access to GPP Organizations";
    }
    this.snackBar.open(message);
  }
}
