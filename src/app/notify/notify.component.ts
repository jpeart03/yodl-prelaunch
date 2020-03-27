import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import 'firebase/firestore';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

/** @title Input with a custom ErrorStateMatcher */
@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.scss'],
})
export class NotifyComponent {
  constructor(private _snackBar: MatSnackBar, public firestore: AngularFirestore, public auth: AngularFireAuth) { }
  notifyForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  matcher = new MyErrorStateMatcher();
  loading = false;

  onNotify() {
    if (this.notifyForm.valid) {
      this.handleAuthAsync();
    }
  }

  triggerSnackbar() {
    this._snackBar.open(
      'Thanks for your interest! We\'ll notify you when we launch.',
      null,
      { duration: 4000, panelClass: ['snackbar'] });
  }

  handleAuthAsync() {
    this.loading = true;
    this.auth.signInAnonymously()
      .then(cred => {
        this.firestore.collection('notify').add(
          {
            UID: cred.user.uid,
            addedOn: new Date(),
            email: this.notifyForm.controls.email.value
          })
          .then(() => {
            this.loading = false;
            this.triggerSnackbar();
            this.notifyForm.reset();
          })
          .catch(error => {
            this.loading = false;
            console.error('Error writing document: ', error);
          });
      })
      .catch(error => {
        this.loading = false;
        console.error('Error authenticating: ', error);
      });
  }
}
