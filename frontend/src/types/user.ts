export type AuthState = {
    status: boolean;
    userData?: {
        username: string;
        email: string;
        isHistory: boolean
    };
};

export type User = {
    _id: string;
    username: string;
    fullName?: string;
    email?: string;
    avatar?: string;
    coverImage?: string;
};