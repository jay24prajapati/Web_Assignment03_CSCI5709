import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export function generateToken(payload: object): string {
    return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

export function generateVerificationToken(length: number): string {
    return crypto.randomBytes(length).toString('hex');
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}
