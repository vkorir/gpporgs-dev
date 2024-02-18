export class Organization {
    id: string;
    address: string;
    createdAt: number;
    // Initialize from here
    name: string = '';
    email: string = '';
    phone: string = '';
    website: string = '';
    region: string = '';
    affiliations: Array<string> = [];
    sectors: Array<string> = [];
    otherSector: string = '';
    type: string = '';
    otherType: string = '';
    approved: boolean = false;
    description: string = '';
    contacts: Array<string> = [];
}