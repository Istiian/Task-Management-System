import passport from "passport";
import {Strategy as JWTStrategy, ExtractJwt} from "passport-jwt";
import User from '../models/user.js';

const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([(req) => {
        return req.cookies.accessToken;
    }]),
    secretOrKey: process.env.TOKEN_SECRET,
};

passport.use(new JWTStrategy(opts, async (payload, done) => {
    try {
        const user = await User.findByPk(payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));