import passport from "passport";
import { User } from "../models/user.model.js";
import { OAuth } from "../models/oauth.model.js";
import { clientID, clientSecret } from "../constants.js";
import { Profile, VerifyCallback, Strategy as GoogleStrategy } from "passport-google-oauth20";

if (!clientID|| !clientSecret) {
  throw new Error("Missing Google OAuth env variables");
}

passport.use(
    new GoogleStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: "/api/v1/auth/google/callback",
    },
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value
                if (!email) {
                return done(null, false, { message: "EMAIL_NOT_FOUND" });
                }

                const existingAccount = await OAuth.findOne({
                    provider: "google",
                    provider_account_id: googleId,
                });

                if (existingAccount) {
                    const user = await User.findById(existingAccount.user);
                    if (!user) {
                        return done(null, false, { message: "USER_NOT_FOUND" });
                    }
                    return done(null, user);
                }

                let user = await User.findOne({ email });

                if (!user) {
                    let fullName = "";

                    if (profile.name?.givenName) {
                        fullName += profile.name.givenName;
                    }

                    if (profile.name?.familyName) {
                        fullName += fullName ? " " + profile.name.familyName : profile.name.familyName;
                    }

                    user = await User.create({
                        username: profile.displayName.replace(/\s+/g, "").toLowerCase(),
                        email: email,
                        fullName,
                        avatar: profile.photos?.[0]?.value
                    })
                }

                if (!user) {
                    return done(null, false, { message: "USER_CREATION_FAILED" });
                }

                const oauth_user = await OAuth.create({
                    user: user._id,
                    provider: "google",
                    provider_account_id: googleId,
                });

                return done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
)

export default passport