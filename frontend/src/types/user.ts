export type AuthState = {
    status: boolean;
    userData?: User
};

export type User = {
    _id: string;
    username: string;
    fullName?: string;
    email?: string;
    avatar?: string;
    coverImage?: string;
};