import bcrypt from 'bcrypt';

const hash = async (plain: string): Promise<string> => {
    return await bcrypt.hash(plain, 11);
};

const compare = async (plain: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(plain, hashed);
};

export { hash, compare };
