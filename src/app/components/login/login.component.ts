import { Component, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  private subscriptions: Subscription[] = [];
  isLoading = true;

  constructor() {
    const sub = this.authService.user$.subscribe(user => {
      this.isLoading = !!user
      if (!!user) {
        this.router.navigate(['dashboard']);
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  login() {
    this.isLoading = true;
    this.authService.loginWithGoogle();
  }
}
