import bcrypt from 'bcrypt';

export const hashPassword = (password) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

export const comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
}
