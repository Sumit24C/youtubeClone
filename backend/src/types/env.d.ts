declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string;
        MONGO_URI: string;
        ACCESS_TOKEN_EXPIRY: string;
        REFRESH_TOKEN_EXPIRY: string;
        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        BACKEND_URL: string;
        NODE_ENV: "development" | "production";
        JWT_SECRET: string;

        R2_BUCKET: string;
        R2_TOKEN: string;
        R2_ACCESS_KEY: string;
        R2_SECRET_KEY: string;
        R2_ENDPOINT: string;
        R2_PUBLIC_URL: string;

        REDIS_HOST: string;
        REDIS_PORT: number;
        REDIS_PASSWORD: string;
    }
}
