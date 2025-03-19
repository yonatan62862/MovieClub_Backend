import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/users_model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
  
          if (!user) {
            user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails?.[0]?.value,
            });
            await user.save();
          }
  
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  
          return done(null, { user, token });
        } catch (error) {
            return done(error, undefined);
        }
      }
    )
  );
  

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  done(null, user.user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

