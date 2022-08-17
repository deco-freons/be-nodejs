import {promises as fs} from 'fs';

const FileSystem = {
    ReadFile: async(path: string) => {
        const file = await fs.readFile(path, 'utf-8');
        return file;
    }
}

export default FileSystem