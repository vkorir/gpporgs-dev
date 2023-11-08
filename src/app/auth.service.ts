import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any;

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
      }
      JSON.parse(localStorage.getItem('user')!);
    });
  }

  // Get authenticated user from Firebase
  getAuthFire(): any {
    return this.auth.currentUser;
  }

  // Get authenticated user from Local Storage
  getAuthLocal(): any {
    const token = localStorage.getItem('user');
    return JSON.parse(token as string);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getAuthLocal() !== null;
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider()).then(() => this.router.navigate(['/']));
  }

  logout() {
    localStorage.removeItem('user');
    signOut(this.auth).then(() => this.router.navigate(['/login']));
  }
}
