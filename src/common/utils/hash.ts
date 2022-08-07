import bcrypt from 'bcrypt';

const hashPassword = async (passwordToHash: string): Promise<string> => {
    return await bcrypt.hash(passwordToHash, 11);
};

const comparePassword = async (hashedPassword: string, plainPassword: string): Promise<boolean> => {
    return await bcrypt.compare(hashedPassword, plainPassword);
};

export { hashPassword, comparePassword };
