import { Injectable, OnDestroy, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, ParsedToken, Unsubscribe, UserCredential, onAuthStateChanged, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Role, User } from '../models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { signInWithRedirect } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  user$ = user(this.auth);
  claims$ = new BehaviorSubject<ParsedToken | undefined>(undefined)

  private unsubscribe: Unsubscribe;

  constructor() {
    this.unsubscribe = onAuthStateChanged(this.auth, async (_user) => {
      this.router.navigateByUrl(_user ? 'dashboard' : '');
      this.claims$.next((await _user?.getIdTokenResult())?.claims);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  // isAdmin(): Observable<boolean> {
  //   // return this.claims$.subscribe(claims => claims)
  // }

  login() {
    signInWithRedirect(this.auth, new GoogleAuthProvider())
      .then((_auth) => this.setUserData(_auth))
      .catch((error) => console.log(error));
  }

  private async setUserData(auth: UserCredential) {
    if (!(auth.user.email || '').endsWith('@berkeley.edu')) {
      this.snackBar.open('Invalid email address', '', { duration: 2000 });
      this.logout();
      return;
    }

    const now = Date.now();
    const _user: User = {
      uid: auth.user.uid,
      role: Role.NONE,
      email: auth.user.email || '',
      name: auth.user.displayName || '',
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
    };

    const docRef = doc(this.firestore, 'users', auth.user.uid);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      // Create new user
      await setDoc(docRef, _user);
      this.snackBar.open("You're signed up! Pending approval", '', {
        duration: 3000,
      });
      this.logout();
      return;
    } else if (snapshot.data()['role'] === Role.NONE) {
      // User not approved yet
      this.snackBar.open('Pending admin approval', '', { duration: 2000 });
      this.logout();
      return;
    }

    // Update user
    _user.role = snapshot.data()['role'];
    _user.createdAt = snapshot.data()['createdAt'];
    _user.loginCount = snapshot.data()['loginCount'] + 1;
    await updateDoc(docRef, _user as any);
  }

  logout() {
    signOut(this.auth);
  }
}
