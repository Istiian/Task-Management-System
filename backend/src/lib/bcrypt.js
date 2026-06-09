import bcrypt from 'bcrypt';

// Hashes a plain-text password. Salt rounds = 10 (good balance of security vs speed).
export const hashPassword = async (password) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

// Returns true if the plain-text password matches the stored hash, false otherwise.
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
