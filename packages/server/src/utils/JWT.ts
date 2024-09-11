import jwt from 'jsonwebtoken';
import { logger } from './pino';

const secretKey = process.env.SECRET_KEY || '';

if (!secretKey) throw new Error('You must specify SECRET_KEY in dev file');

export const generateToken = (data: object, expire: string = '30D') =>
  jwt.sign(data, secretKey, { expiresIn: expire });

export const verifyToken = (
  token: string,
): Promise<string | jwt.JwtPayload | undefined> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        logger.error(`Token not provided ${err}}`);
        return reject(err);
      }
      resolve(decoded);
    });
  });