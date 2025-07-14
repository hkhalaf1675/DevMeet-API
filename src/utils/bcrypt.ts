import {genSalt, hash, compare } from 'bcryptjs';

//#region hash text
/**
 * 
 * @param text - the text to be hashed
 * @param saltRounds the number of rounds to use for generating the salt, default is 10
 * @returns a hashed string
 */
export const hashText = async (text: string, saltRounds: number = 10): Promise<string> => {
    const salt = await genSalt(saltRounds);

    return await hash(text, salt);
}
//#endregion

//#region compare hashed text to plain text
/**
 * 
 * @param text the plain text to compare
 * @param hashedText the hashed text to compare against
 * @returns boolean 
 */
export const compareText = async (text: string, hashedText: string): Promise<boolean> => {
    return await compare(text, hashedText);
}
//#endregion