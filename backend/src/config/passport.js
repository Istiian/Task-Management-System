import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.js';

// Reads the JWT from the Authorization: Bearer header and verifies it.
// If the user still exists in the DB, attaches { id } to req.user.
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET,
};

passport.use(new JWTStrategy(opts, async (payload, done) => {
    try {
        const user = await User.findByPk(payload.id);
        if (user) {
            return done(null, { id: payload.id }); // only id is needed downstream
        }
        return done(null, false); // user deleted or not found
    } catch (error) {
        return done(error, false);
    }
}));
