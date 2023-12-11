export interface Organization {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    region: string;
    affiliations: Array<string>;
    sectors: Array<string>;
    otherSector: string;
    type: string;
    otherType: string;
    createdAt: number;
    approved: boolean;
    description: string;
    address: string;
    contacts: Array<string>;
}