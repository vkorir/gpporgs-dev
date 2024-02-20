export class Review {
    id: string;
    organization: string;
    cost: number = 0;
    stipend: number = 0;
    duration: string = '';
    safety: number = 0;
    region: string = '';
    languages: Array<string> = [];
    sectors: Array<string> = [];
    otherSector: string = '';
    evaluation: string = '';
    typicalDay: string = '';
    workDone: string = '';
    difficulties: string = '';
    responsiveness: string = '';
    otherComments: string = '';
    createdAt: number;
    reviewer: string;
    anonymous: boolean = true;
    address: string;
}