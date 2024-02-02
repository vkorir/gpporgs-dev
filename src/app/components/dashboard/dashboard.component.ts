import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  readonly firestoreService = inject(FirestoreService);
  
  displayCols = ['name', 'type', 'country', 'sectors'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isLoading: boolean = false;

  ngAfterViewInit(): void {
    this.isLoading = true;
    this.dataSource.paginator = this.paginator;
    this.firestoreService.getOrganizations().subscribe(res => {
      res = res.filter(org => !org.name.startsWith('!')); // exclude non approved
      this.dataSource.data = res;
      this.isLoading = false;
    });
  }

  formatSectors(sectors: string[]): string {
    return sectors.map(id => this.firestoreService.sectors.get(id)).join('\n');
  }
}
