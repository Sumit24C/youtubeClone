import { CookieOptions } from "express";


export const accessTokenExpiry: number = Number(
  process.env.ACCESS_TOKEN_EXPIRY
);
export const refreshTokenExpiry: number = Number(
  process.env.REFRESH_TOKEN_EXPIRY
);

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "lax"
    | "none",
};

export const BACKEND_URL: string =
  process.env.BACKEND_URL || "http://localhost:8000";
