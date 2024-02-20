import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Review } from 'src/app/models/review';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
})
export class ReviewsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private fireService = inject(FirestoreService);

  private organization: string | null;
  // formGroup = this.fb.group({});
  reviews: Review[];
  isLoading = false;

  // For auto-unsubscribe
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.organization = this.route.snapshot.paramMap.get('id');
    this.fetchReview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchReview() {
    this.isLoading = true;
    this.reviews = [];
    this.fireService
      .getReviews(this.organization)
      .pipe(takeUntil(this.destroy$))
      .subscribe((_reviews) => {
        // const reviewControls = [];
        for (let _review of _reviews) {
          // const reviewControl: any = {};
          // for (let key of Object.keys(new Review())) {
          //   reviewControl[key] = _review[key];
          // }
          // reviewControls.push(this.fb.group(reviewControl));
          this.reviews.push(_review);
          // this.fetchAddress(_review.address);
        }
        // this.formGroup.addControl('reviews', this.fb.array(reviewControls));
        this.isLoading = false;
      });
  }

  private fetchAddress(id: string) {}

  getDate(time: number): string {
    const date = new Date(time);
    const padTo2Digits = (num: number) => {
      return num.toString().padStart(2, '0');
    };
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes())].join(':')
    );
  }

  goBack() {
    this.location.back();
  }
}
