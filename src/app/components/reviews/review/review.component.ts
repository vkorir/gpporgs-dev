import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { Address } from 'src/app/models/address';
import { Review } from 'src/app/models/review';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent implements OnInit {
  private fb = inject(FormBuilder);
  fireService = inject(FirestoreService);

  @Input() data!: any;

  formGroup = this.fb.group({});
  isLoading = false;
  isReadOnly = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  // For auto-unsubscribe
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    console.log(this.data);
    this.initControls();
    this.fetchAddress();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initControls() {
    for (const key of Object.keys(new Review())) {
      this.formGroup.addControl(key, this.fb.control(this.data[key]));
    }
  }

  fetchAddress() {
    this.isLoading = true;
    this.fireService
      .getAddress(this.data.address)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.data['address'] = result;
        const controls: any = {};
        for (const key of Object.keys(new Address())) {
          controls[key] = result[key];
        }
        this.formGroup.addControl('address', this.fb.group(controls));
        this.isLoading = false;
      });
  }

  getCountry(): string {
    return this.fireService.countries.get(this.data.address.country) || '';
  }

  getRegion(): string {
    let value = this.fireService.regions.get(this.data.region);
    if (value?.toLowerCase().includes('other') && this.data.otherRegion) {
      value = this.data.otherRegion;
    }
    return value || '';
  }

  getLanguages(): string[] {
    return this.data.languages.map((code: string) =>
      this.fireService.languages.get(code)
    );
  }

  addLanguage(event: MatChipInputEvent): void {
    console.log(event.value);
  }

  getType(): string {
    let value = this.fireService.types.get(this.data.type);
    if (value?.toLowerCase().includes('other') && this.data.otherType) {
      value = this.data.otherType;
    }
    return value || '';
  }

  getSectors(): string {
    let values: string[] = [];
    for (const id of this.data.sectors) {
      let value = this.fireService.sectors.get(id);
      if (value?.toLowerCase().includes('other') && this.data.otherSector) {
        value = this.data.otherSector;
      }
      if (value) values.push(value);
    }
    return values.join(', ');
  }
}
