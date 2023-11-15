export interface User {
    uid: string;
    role: Role;
    email: string;
    name: string;
    createdAt: number;
    lastLoginAt: number;
    loginCount: number;
}

export enum Role {
    NONE = 'NONE', STUDENT = 'STUDENT', ADMIN = 'ADMIN'
}
