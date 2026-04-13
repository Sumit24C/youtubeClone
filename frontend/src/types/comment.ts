export type Comment = {
    _id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    user: {
        _id: string;
        username: string;
        avatar?: string;
    };
    repliesCount?: number;
    likesCount: number;
    isLiked: boolean;
};
