import bcrypt from 'bcrypt';

const Crypt = {
    hash: async (plain: string): Promise<string> => {
        return await bcrypt.hash(plain, 11);
    },

    compare: async (plain: string, hashed: string): Promise<boolean> => {
        return await bcrypt.compare(plain, hashed);
    },

    salt: async (): Promise<string> => {
        return await bcrypt.genSalt();
    },
};

export default Crypt;
