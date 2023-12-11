export interface User {
    id: string;
    role: Role;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: number;
    lastLoginAt: number;
    loginCount: number;
}

export enum Role {
    NONE = 'NONE', STUDENT = 'STUDENT', ADMIN = 'ADMIN'
}
