import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Area } from 'src/app/models/enums';
import { Filter } from 'src/app/models/filter';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly fireService = inject(FirestoreService);

  displayCols = ['name', 'type', 'country', 'sectors'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  areas = [Area.DOMESTIC, Area.INTERNATIONAL];
  sectors = <any>[];

  nameControl: FormControl;
  areaControls: FormGroup;
  sectorControls: FormGroup;
  filterValues = new Filter();

  private subscriptions: Subscription[] = [];
  isAllSectorsChecked = true;
  isDataLoading = false;

  ngOnInit(): void {
    this.initOrganizationsData();
    const sub = this.fireService.dataLoaded$.subscribe(() => {
      this.initFilterControls();
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  initFilterControls() {
    this.nameControl = this.fb.control('');
    const _areaControls: any = {};
    for (const area of this.areas) {
      _areaControls[area] = true;
      this.filterValues.areas.push(area);
    }
    this.areaControls = this.fb.group(_areaControls);
    const _sectorControls: any = {};
    for (const [key, value] of this.fireService.sectors.entries()) {
      _sectorControls[key] = true;
      this.sectors.push({ key, value });
      this.filterValues.sectors.push(key);
    }
    this.sectorControls = this.fb.group(_sectorControls);
    this.registerSubscriptions();
  }

  initOrganizationsData() {
    this.isDataLoading = true;
    this.dataSource.filterPredicate = this.applyFilter;
    const sub = this.fireService.getOrganizations(true).subscribe((orgs) => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.data = orgs;
      this.isDataLoading = false;
    });
    this.subscriptions.push(sub);
  }

  updateAllSectorsChecked() {
    for (const key in Object.keys(this.sectorControls.controls)) {
      if (!this.sectorControls.get(key)?.value) {
        this.isAllSectorsChecked = false;
        return;
      }
    }
    this.isAllSectorsChecked = true;
  }

  someSectorsChecked(): boolean {
    const values = Object.values(this.sectorControls.value);
    let count = values.length;
    for (const val of values) {
      if (val) count--;
    }
    return count > 0 && count < values.length;
  }

  setAllSectors(value: boolean): void {
    const update: any = {};
    Object.keys(this.sectorControls.controls).map(
      (key) => (update[key] = value)
    );
    this.sectorControls.reset(update);
  }

  registerSubscriptions() {
    let sub;
    sub = this.nameControl.valueChanges.subscribe((name) => {
      this.filterValues.name = name.trim().toLowerCase();
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.subscriptions.push(sub);

    sub = this.areaControls.valueChanges.subscribe((event) => {
      const _areas: string[] = [];
      Object.keys(event).forEach((key) => {
        if (event[key]) _areas.push(key);
      });
      this.filterValues.areas = _areas;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.subscriptions.push(sub);

    sub = this.sectorControls.valueChanges.subscribe((event) => {
      const _sectors: string[] = [];
      Object.keys(event).forEach((key) => {
        if (event[key]) _sectors.push(key);
      });
      this.filterValues.sectors = _sectors;
      this.dataSource.filter = JSON.stringify(this.filterValues);
      this.updateAllSectorsChecked();
    });
    this.subscriptions.push(sub);
  }

  applyFilter(org: any, filter: string) {
    try {
      const _filter = JSON.parse(filter);
      const _nameMatch = org.name.trim().toLowerCase().includes(_filter.name);
      const _areaMatch =
        !org.country ||
        (_filter.areas.includes(Area.DOMESTIC) && org.country == 'US') ||
        (_filter.areas.includes(Area.INTERNATIONAL) && org.country != 'US');
      const _sectors = new Set(org.sectors);
      const _sectorsMatch =
        org.sectors.length == 0 ||
        [...new Set(_filter.sectors)].filter((sec) => _sectors.has(sec))
          .length > 0;

      return _nameMatch && _areaMatch && _sectorsMatch;
    } catch (e) {
      return true; // fail safe
    }
  }

  formatSectors(sectors: string[]): string {
    return sectors.map((id) => this.fireService.sectors.get(id)).join('\n');
  }

  onClickOrganization(id: string) {
    this.router.navigate(['details', id]);
  }
}
