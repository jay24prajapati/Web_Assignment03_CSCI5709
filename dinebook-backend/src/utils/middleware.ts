import jwt from 'jsonwebtoken';
import { User } from '../models';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, userPayload } from '../types/';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as userPayload;
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        req.user = { ...user.toObject(), id: user._id.toString() };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};
