
export interface User {
    id: string;
    email: string;
}

export interface AuthPayload {
    sub: string;
    email: string;
}

export interface Variables {
    user: AuthPayload;
}
