export type Channel = {
    _id: string;
    username: string;
    avatar?: string;
    isSubscribed: boolean;
    subscribersCount: number;
    description?: string
};
