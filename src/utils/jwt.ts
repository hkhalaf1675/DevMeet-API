import { sign, verify } from "jsonwebtoken";
import appConfig from "../config/app.config";

const secretKey = appConfig.jwt.secret;

//#region create jwt token
/**
 * 
 * @param payload - the payload to be signedd
 * @returns string - a signed jwt token
 */
export const createJwtToken = (payload: object): string => {
    return sign(payload, secretKey, {
        expiresIn: `${appConfig.jwt.expiresIn}h`
    });
}
//#endregion

//#region verify jwt token
/**
 * 
 * @param token - the jwt token to be verified
 * @returns the decoded payload if the token is valid, otherwise throw an error
 */
export const verifyJwtToken = (token: string): any => {
    return verify(token, secretKey);
}
//#endregion