import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData } from '@angular/fire/firestore';
import { DocumentReference, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
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

  constructor() {
    const id = { idField: 'id'};

    collectionData(collection(this.firestore, 'affiliations'), id).subscribe(res => {
      res.forEach(({ id, name}) => this.affiliations.set(id, name));
    });

    collectionData(collection(this.firestore, 'countries')).subscribe(res => {
      res.forEach(({ code, name}) => this.countries.set(code, name));
    });

    collectionData(collection(this.firestore, 'languages')).subscribe(res => {
      res.forEach(({ code, name}) => this.languages.set(code, name));
    });

    collectionData(collection(this.firestore, 'regions'), id).subscribe(res => {
      res.forEach(({ id, name}) => this.regions.set(id, name));
    });

    collectionData(collection(this.firestore, 'sectors'), id).subscribe(res => {
      res.forEach(({ id, name}) => this.sectors.set(id, name));
    });

    collectionData(collection(this.firestore, 'types'), id).subscribe(res => {
      res.forEach(({ id, name}) => this.types.set(id, name));
    });
  }

  getOrganizations(_approved: boolean): Observable<any[]> {
    const order = orderBy('name', 'asc');
    const approved = where('approved', '==', _approved);
    const orgCollection = collection(this.firestore, this.organizations);
    return collectionData(query(orgCollection, approved, order));
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
