import { useRef, useState } from "react";
import { useAxiosPrivate } from "../../../hooks/useAxiosPrivate"
import type { Item } from "../types";
import { BUFFER_SIZE, CONCURRENCY, WINDOW_SIZE } from "../constants";
import { completeUpload, getPartUrls, getUploadStatus, uploadChunk } from "../services/uploadService";

interface Props {
    videoId: string,
    uploadId: string,
    key: string,
    chunks: Blob[],
    file: File,
}

export const useUpload = ({
    videoId,
    uploadId,
    key,
    chunks,
    file,
}: Props) => {
    const api = useAxiosPrivate();
    const [progress, setProgress] = useState<number>(0);
    const isPausedRef = useRef<boolean>(false);

    const controllersRef = useRef<Record<number, AbortController>>({});
    const progressMapRef = useRef<Record<number, number>>({});

    const nextPartRef = useRef(1);
    const uploadQueue = useRef<Item[]>([]);
    const bufferQueue = useRef<Item[]>([]);
    const uploadedPartsRef = useRef<number[]>([]);
    const isRefillingRef = useRef(false);
    const waitRef = useRef<() => void | null>(null);

    const waitForItem = async () => {
        new Promise<void>((resolve, _reject) => waitRef.current = resolve)
    }

    const notifyWorkers = () => {
        if (waitRef.current) {
            waitRef.current();
            waitRef.current = null;
        }
    }

    const fillInitialQueues = async () => {
        const parNumbers: number[] = [];

        for (let i = 0; i < WINDOW_SIZE + BUFFER_SIZE; i++) {
            if (nextPartRef.current > chunks.length) break;
            parNumbers.push(nextPartRef.current++);
        }

        const urls = await getPartUrls(api, uploadId, key, parNumbers);
        for (let i = 0; i < WINDOW_SIZE; i++) {
            uploadQueue.current.push({
                chunk: chunks[i],
                PartNumber: parNumbers[i],
                url: urls[i].url
            });
        }

        for (let i = WINDOW_SIZE; i < BUFFER_SIZE + WINDOW_SIZE; i++) {
            bufferQueue.current.push({
                chunk: chunks[i],
                PartNumber: parNumbers[i],
                url: urls[i].url
            });
        }
    }

    const refillBuffer = async () => {
        if (bufferQueue.current.length > BUFFER_SIZE / 2 || isRefillingRef.current) return;
        isRefillingRef.current = true;
        const parNumbers: number[] = [];

        while (parNumbers.length < BUFFER_SIZE && nextPartRef.current <= chunks.length) {
            if (uploadedPartsRef.current.includes(nextPartRef.current)) continue;
            parNumbers.push(nextPartRef.current++);
        }

        if (parNumbers.length === 0) {
            isRefillingRef.current = false;
            return;
        }

        const urls = await getPartUrls(api, uploadId, key, parNumbers);
        parNumbers.forEach((p, i) => {
            bufferQueue.current.push({
                chunk: chunks[p - 1],
                PartNumber: p,
                url: urls[i].url
            });
        });

        while (bufferQueue.current.length > 0 && uploadQueue.current.length < WINDOW_SIZE) {
            uploadQueue.current.push(bufferQueue.current.shift()!);
        }

        isRefillingRef.current = false;
        notifyWorkers();
    }

    const worker = async () => {
        while (true) {
            if (isPausedRef.current) return;
            let item = uploadQueue.current.shift();
            if (!item) {
                await waitForItem();
                continue;
            };

            await uploadChunk({
                api,
                item,
                file,
                videoId,
                progressMap: progressMapRef.current,
                controllersMap: controllersRef.current,
                onProgress: setProgress,
                isPausedRef,
                retries: 3
            });

            refillBuffer();
        }
    }

    const startUpload = async (isResumed = false) => {
        if (!isResumed) await fillInitialQueues();
        const workers = Array(CONCURRENCY)
            .fill(null)
            .map(async () => {
                await worker();
            });

        await Promise.all(workers);
        if (!isPausedRef.current) {
            await completeUpload(api, videoId);
        }
    }

    const pauseUpload = async () => {
        isPausedRef.current = true;
        Object.values(controllersRef.current).forEach((c) => c.abort());
        controllersRef.current = {};
    }

    const resumeUpload = async () => {
        isPausedRef.current = false;
        const status = await getUploadStatus(api, videoId);

        uploadedPartsRef.current = (status.uploadedParts.map((p: Item) => p.PartNumber));
        await startUpload(true);
    }


    return {
        progress,
        startUpload,
        pauseUpload,
        resumeUpload,
    }
}