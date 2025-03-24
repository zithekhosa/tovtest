import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    console.log(`Compare passwords: supplied (length ${supplied.length}), stored (length ${stored.length})`);
    
    const [hashed, salt] = stored.split(".");
    
    if (!hashed || !salt) {
      console.error(`Invalid stored password format: ${stored.substring(0, 10)}...`);
      return false;
    }
    
    console.log(`Password has valid format with salt: ${salt.substring(0, 5)}...`);
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log(`Password comparison result: ${result}`);
    
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}