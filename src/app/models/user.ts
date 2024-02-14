export interface User {
    id: string;
    role: Role;
    name: string;
    email: string;
    createdAt: number;
    lastLoginAt: number;
    loginCount: number;
}

export enum Role {
    NONE = 'NONE', STUDENT = 'STUDENT', ADMIN = 'ADMIN'
}
