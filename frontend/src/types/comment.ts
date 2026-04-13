export type Comment = {
    _id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    owner: {
        _id: string;
        username: string;
        avatar?: string;
    };
    repliesCount?: number;
    likesCount: number;
    isLiked: boolean;
};
