import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData } from '@angular/fire/firestore';
import { DocumentReference, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { Address } from '../models/address';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private readonly organizations = 'organizations';
  private readonly addresses = 'addresses';

  readonly affiliations = new Map<string, string>();
  readonly countries = new Map<string, string>();
  readonly languages = new Map<string, string>();
  readonly regions = new Map<string, string>();
  readonly sectors = new Map<string, string>();
  readonly types = new Map<string, string>();

  constructor() {}

  fetchData() {
    const id = { idField: 'id'};
    const affiliationsCol = collectionData(collection(this.firestore, 'affiliations'), id);
    const countriesCol = collectionData(collection(this.firestore, 'countries'));
    const languagesCol = collectionData(collection(this.firestore, 'languages'));
    const regionsCol = collectionData(collection(this.firestore, 'regions'), id);
    const sectorsCol = collectionData(collection(this.firestore, 'sectors'), id);
    const typesCol = collectionData(collection(this.firestore, 'types'), id);
    const allCols = [affiliationsCol, countriesCol, languagesCol, regionsCol, sectorsCol, typesCol];
    return combineLatest(allCols)
    .pipe(map(([_affiliations, _countries, _languages, _regions, _sectors, _types]) => {
      _affiliations.forEach(({ id, name}) => this.affiliations.set(id, name));
      _countries.forEach(({ code, name}) => this.countries.set(code, name));
      _languages.forEach(({ code, name}) => this.languages.set(code, name));
      _regions.forEach(({ id, name}) => this.regions.set(id, name));
      _sectors.forEach(({ id, name}) => this.sectors.set(id, name));
      _types.forEach(({ id, name}) => this.types.set(id, name));
    }));
  }

  getOrganizations(_approved: boolean): Observable<any[]> {
    const order = orderBy('name', 'asc');
    const approved = where('approved', '==', _approved);
    const orgCollection = collection(this.firestore, this.organizations);
    return collectionData(query(orgCollection, approved, order, limit(10)));
  }

  updateOrganization(id: string, partial: any) {
    const docRef = doc(this.firestore, `${this.organizations}/${id}`);
    updateDoc(docRef, partial);
  }

  getAddress(id: string): Observable<Address | undefined> {
    const docRef = doc(this.firestore, `${this.addresses}/${id}`);
    return docData(docRef as DocumentReference<Address>);
  }
}
