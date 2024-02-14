import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly fireService = inject(FirestoreService);

  ngOnInit(): void {
      console.log(this.route.snapshot.paramMap.get('id'));
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }
}
