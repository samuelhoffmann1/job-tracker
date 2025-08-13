import { EncryptJWT, JWTPayload } from 'jose';
import crypto from 'crypto';

export async function generateTestToken(payload: JWTPayload, secretString: string) {
  const info = 'NextAuth.js Generated Encryption Key';
  const salt = new Uint8Array(0); // Empty salt
  const derivedKey = crypto.hkdfSync('sha256', secretString, salt, info, 32);
  const secret = new Uint8Array(derivedKey);

  const token = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .encrypt(secret);

  return token;
}