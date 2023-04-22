import googleStrategy from "passport-google-oauth20";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from "../models/user-model.js";
import "dotenv/config";

//Google Strategy
const googlePassport = (passport) => {
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/user/google/redirect",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        let foundUser = await User.findOne({ googleID: profile.id }).exec();
        if (!foundUser) {
          let newUser = new User({
            signUpType: "google",
            googleID: profile.id,
            email: profile.emails[0].value,
          });
          let savedUser = await newUser.save();
          done(null, savedUser);
        } else {
          done(null, foundUser);
        }
      }
    )
  );
};

//Jwt Strategy
const jwtPassport = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_JWT_SECRET;
  passport.use(
    new Strategy(opts, async function (jwt_payload, done) {
      try {
        let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (foundUser) {
          return done(null, foundUser);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};

export { googlePassport, jwtPassport };
