import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subject, first, takeUntil } from 'rxjs';
import { Organization } from 'src/app/models/organization';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-details',
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
})
export class OrganizationComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  readonly fireService = inject(FirestoreService);

  organization = new Organization();
  formGroup = this.fb.group({}, {});
  isEditDisabled = true;

  loading = { organization: true, address: true, contacts: true };

  // For auto-unsubscribe
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.formGroup.disable();
    this.fetchOrganzation(this.route.snapshot.paramMap.get('id'));
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

  fetchOrganzation(id: string | null) {
    if (!id) {
      this.snackBar.open('Organization not found');
      return;
    }
    this.fireService
      .getOrganization(id)
      .pipe(first())
      .subscribe((_organization) => {
        if (_organization) {
          this.organization = _organization;
          this.initFormControls();
          this.fetchAddress(_organization.address);
          this.fetchContacts(_organization.contacts);
          this.loading.organization = false;
        }
      });
  }

  private fetchAddress(id: string) {
    this.fireService
      .getAddress(id)
      .pipe(first())
      .subscribe((_address) => {
        const controls: any = {};
        for (const [key, value] of Object.entries(_address as any)) {
          controls[key] = this.fb.control(value);
        }
        this.formGroup.addControl('address', this.fb.group(controls));
        this.formGroup.disable();
        this.loading.address = false;
      });
  }

  private fetchContacts(ids: string[]) {
    for (const id of ids) {
      this.fetchContact(id);
    }
    this.formGroup.disable();
    this.loading.contacts = false;
  }

  private fetchContact(id: string | null) {
    if (id) {
      this.fireService.getContact(id).pipe(takeUntil(this.destroy$))
    .subscribe((_contact) => {
      const controls = [];
      for (const [key, value] of Object.entries(_contact)) {
        controls.push(this.fb.control(value));
      }
      this.formGroup.addControl('contacts', this.fb.array(controls));
    });
    }
  }

  initFormControls() {
    for (const [key, value] of Object.entries(new Organization())) {
      if (typeof value == 'string') {
        this.formGroup.addControl(key, this.fb.control(value));
      }
    }
    this.formGroup.disable();
  }

  goBack() {
    this.location.back();
  }
}
