import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  combineLatest,
  map,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService implements OnDestroy {
  private firestore = inject(Firestore);
  private readonly organizations = 'organizations';
  private readonly addresses = 'addresses';
  private readonly contacts = 'contacts';
  private readonly reviews = 'reviews';

  readonly affiliations = new Map<string, string>();
  readonly countries = new Map<string, string>();
  readonly languages = new Map<string, string>();
  readonly regions = new Map<string, string>();
  readonly sectors = new Map<string, string>();
  readonly types = new Map<string, string>();

  private dataLoaded = new BehaviorSubject<boolean>(true);
  public dataLoaded$: Observable<boolean> = this.dataLoaded.asObservable();
  private subscriptions: Subscription[] = [];

  constructor() {
    const id = { idField: 'id' };
    const _collections = [
      collectionData(collection(this.firestore, 'affiliations'), id),
      collectionData(collection(this.firestore, 'countries')),
      collectionData(collection(this.firestore, 'languages')),
      collectionData(collection(this.firestore, 'regions'), id),
      collectionData(collection(this.firestore, 'sectors'), id),
      collectionData(collection(this.firestore, 'types'), id),
    ];
    const sub = combineLatest(_collections)
      .pipe(
        map(([_aff, _cou, _lan, _reg, _sec, _typ]) => {
          _aff.forEach(({ id, name }) => this.affiliations.set(id, name));
          _cou.forEach(({ code, name }) => this.countries.set(code, name));
          _lan.forEach(({ code, name }) => this.languages.set(code, name));
          _reg.forEach(({ id, name }) => this.regions.set(id, name));
          _sec.forEach(({ id, name }) => this.sectors.set(id, name));
          _typ.forEach(({ id, name }) => this.types.set(id, name));
        })
      )
      .subscribe((_) => this.dataLoaded.next(true)); // notify on loading complete
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getOrganization(id: string): Observable<any> {
    return docData(doc(this.firestore, this.organizations, id));
  }

  getOrganizations(approved: boolean): Observable<any[]> {
    const order = orderBy('name', 'asc');
    const condition = where('approved', '==', approved);
    const col = collection(this.firestore, this.organizations);
    return collectionData(query(col, condition, order));
  }

  updateOrganization(id: string, partial: any): void {
    const docRef = doc(this.firestore, this.organizations, id);
    updateDoc(docRef, partial);
  }

  getAddress(id: string): Observable<any> {
    const docRef = doc(this.firestore, this.addresses, id);
    return docData(docRef);
  }

  getContact(id: string): Observable<any> {
    const docRef = doc(this.firestore, this.contacts, id);
    return docData(docRef, { idField: 'id' });
  }

  getReviews(organization: string | null): Observable<any[]> {
    const order = orderBy('createdAt', 'desc');
    const condition = where('organization', '==', organization);
    const col = collection(this.firestore, this.reviews);
    return collectionData(query(col, condition, order));
  }
}
