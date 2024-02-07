import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Area } from 'src/app/models/enums';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  readonly firestoreService = inject(FirestoreService);
  
  displayCols = ['name', 'type', 'country', 'sectors'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  isLoading: boolean = true;
  filterControl: FormGroup;

  areas = [Area.DOMESTIC, Area.INTERNATIONAL];

  ngOnInit(): void {
    const areaControls = this.areas.map(_ => this.fb.control(true));
    this.filterControl = this.fb.group({
      area: this.fb.array(areaControls),
    });
    console.log(this.areas);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.firestoreService.getOrganizations(true).subscribe(orgs => {
      this.dataSource.data = orgs;
      this.isLoading = false;
    });
  }

  formatSectors(sectors: string[]): string {
    return sectors.map(id => this.firestoreService.sectors.get(id)).join('\n');
  }

  filterByName($event: any): void {
    console.log($event.target.value);
  }
}
