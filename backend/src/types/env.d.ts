declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGO_URI: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
    BACKEND_URL: string;
    NODE_ENV: "development" | "production";
    JWT_SECRET: string;
  }
}