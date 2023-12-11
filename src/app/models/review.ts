export interface Review {
    id: string;
    organization: string;
    cost: number;
    stipend: number;
    duration: string;
    safety: number;
    region: string;
    languages: Array<string>;
    sectors: Array<string>;
    otherSector: string;
    evaluation: string;
    typicalDay: string;
    workDone: string;
    difficulties: string;
    responsiveness: string;
    otherComments: string;
    createdAt: number;
    reviewer: string;
    anonymous: boolean;
    address: string;
}