import fs from 'fs'
import path from 'path'

import { getHomeFolder } from 'platform-folders'

export default class Files {
    public static getAppFolder(): string {
        const dir = path.join(getHomeFolder(), 'Instavous')
        return Files.getDirectory(dir)
    }

    public static getUsersFolder(createAlphaFolders: boolean = false): string {
       const dir = path.join(Files.getAppFolder(), 'Users')

        if (createAlphaFolders) {
            const CAPITAL_A = 65

            for (let char = 0; char < 26; char++) {
                const letter = String.fromCharCode(CAPITAL_A + char)
                Files.getDirectory(Files.getUsersFolder(), letter)
            }
        }

       return Files.getDirectory(dir) 
    }

    public static getDirectory(...paths: string[]): string {
        const dir = path.join(...paths)

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    
        return dir 
    }
}