import type { AxiosInstance } from "axios";

export type Item = {
    chunk: Blob;
    PartNumber: number;
    url: string;
};

export type UploadChunkParams = {
    item: Item,
    file: File;
    videoId: string;
    api: AxiosInstance;
    progressMap: Record<number, number>;
    controllersMap: Record<number, AbortController>;
    onProgress?: (percent: number) => void;
    isPausedRef?: React.RefObject<boolean>;
    retries?: number;
};