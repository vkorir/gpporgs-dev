import { Component, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private provider = new GoogleAuthProvider();

  user$ = user(this.auth);
  isLoading = true;

  constructor() {
    onAuthStateChanged(this.auth, (_user) => {
      if (_user) {
        this.router.navigate(['dashboard']);
      }
      this.isLoading = false;
    });
    getRedirectResult(this.auth)
      .then((result) => this.updateUser(result))
      .catch((error) => this.handleError(error));
  }

  login() {
    this.isLoading = true;
    setTimeout(() => signInWithRedirect(this.auth, this.provider), 700);
  }

  private updateUser(auth: UserCredential | null) {
    if (!auth) return;
    const users = 'users';
    const id = { idField: 'id' };
    const match = where('email', '==', auth.user.email);
    const usersCol = collection(this.firestore, users);
    collectionData(query(usersCol, match), id)
      .pipe(first())
      .subscribe((_users) => {
        if (_users.length == 0) return;
        const _user = _users[0] as User;
        const docRef = doc(this.firestore, users, _user.id);
        const _update = {
          name: auth.user.displayName,
          createdAt: Date.parse(auth.user.metadata.creationTime || ''),
          lastLoginAt: Date.parse(auth.user.metadata.lastSignInTime || ''),
          loginCount: _user.loginCount + 1,
        };
        updateDoc(docRef, _update);
      });
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
