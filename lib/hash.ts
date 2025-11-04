import bcrypt from "bcrypt";

/** Hash a plaintext password */
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

/** Compare plaintext to hashed password */
export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
