import { Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-details',
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss'
})
export class OrganizationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  readonly fireService = inject(FirestoreService);

  ngOnInit(): void {
      console.log(this.route.snapshot.paramMap.get('id'));
  }

  goBack() {
    this.location.back();
  }
}
