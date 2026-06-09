const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth',
};

export const setRefreshTokenCookie = (res, token) => {
    res.cookie(REFRESH_TOKEN_COOKIE, token, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
};

export const clearRefreshTokenCookie = (res) => {
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
};

export const getRefreshTokenFromRequest = (req) => req.cookies?.[REFRESH_TOKEN_COOKIE];
