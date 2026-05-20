import jwt from 'jsonwebtoken';
import { authConfig } from '../config/env.js';

export function signAuthToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
    );
}

export function verifyAuthToken(token) {
    return jwt.verify(token, authConfig.jwtSecret);
}
