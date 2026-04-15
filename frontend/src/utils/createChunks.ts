export const CHUNK_SIZE = 5 * 1024 * 1024;

export const createChunks = (file: File) => {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
        chunks.push(file.slice(start, start + CHUNK_SIZE));
        start += CHUNK_SIZE;
    }

    return chunks;
};