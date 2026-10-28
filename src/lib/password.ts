import crypto from "crypto";

const SCRYPT_PREFIX = "scrypt:";
const KEY_LEN = 64;

/**
 * Hashes a plaintext password using Node.js scrypt with a unique random salt.
 */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(password, salt, KEY_LEN);
    return `${SCRYPT_PREFIX}${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a stored value (either hashed with scrypt or legacy plaintext).
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedValue: string | null | undefined): boolean {
    if (!storedValue || !password) {
        return false;
    }

    if (storedValue.startsWith(SCRYPT_PREFIX)) {
        try {
            const parts = storedValue.split(":");
            if (parts.length !== 3) {
                return false;
            }
            const salt = parts[1];
            const storedHash = parts[2];
            const derivedKey = crypto.scryptSync(password, salt, KEY_LEN);
            const storedBuffer = Buffer.from(storedHash, "hex");

            if (storedBuffer.length !== derivedKey.length) {
                return false;
            }

            return crypto.timingSafeEqual(storedBuffer, derivedKey);
        } catch {
            return false;
        }
    }

    // Legacy plaintext support with timing-safe comparison
    try {
        const storedBuffer = Buffer.from(storedValue);
        const inputBuffer = Buffer.from(password);
        if (storedBuffer.length !== inputBuffer.length) {
            return false;
        }
        return crypto.timingSafeEqual(storedBuffer, inputBuffer);
    } catch {
        return false;
    }
}

/**
 * Checks if a stored password needs to be upgraded/re-hashed to scrypt.
 */
export function needsRehash(storedValue: string | null | undefined): boolean {
    if (!storedValue) return false;
    return !storedValue.startsWith(SCRYPT_PREFIX);
}

