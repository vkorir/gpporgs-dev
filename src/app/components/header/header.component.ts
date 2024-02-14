import { Component, inject } from '@angular/core';
import { Auth, user, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  user$ = user(this.auth);

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['']);
  }
}
