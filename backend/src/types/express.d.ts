import type { UserDocument } from "../models/user.model";

declare module "express-serve-static-core" {
    interface User extends UserDocument {}

    interface Request {
        user?: UserDocument;
    }
}