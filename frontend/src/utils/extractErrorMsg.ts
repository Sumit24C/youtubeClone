import { AxiosError } from "axios";

export const extractErrorMsg = (error: unknown) => {
    const err = error as AxiosError<any>;

    return err?.response?.data?.message || "Something went wrong";
}