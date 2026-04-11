import { User } from ".././models/user.model.js";
import { OAuth } from ".././models/oauth.model.js";

export const handleGoogleLogin = async (profile: any) => {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;

    const existingAccount = await OAuth.findOne({
        provider: "google",
        provider_account_id: googleId,
    });

    if (existingAccount) {
        return await User.findById(existingAccount.user);
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            username: profile.displayName.replace(/\s+/g, "").toLowerCase(),
            email,
            fullName: `${profile.name?.givenName || ""} ${
                profile.name?.familyName || ""
            }`.trim(),
            avatar: profile.photos?.[0]?.value,
        });
    }

    await OAuth.create({
        user: user._id,
        provider: "google",
        provider_account_id: googleId,
    });

    return user;
};
