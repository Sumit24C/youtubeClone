import { z } from "zod";

const envSchema = z.object({
    VITE_API_URL: z.url(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables");
}

export const ENV = {
    BASE_URL: parsedEnv.data.VITE_API_URL,
};