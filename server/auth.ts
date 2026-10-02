import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Patient, Doctor, db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quickcare-jwt-secret-token-key-2026';

export interface AuthRequest extends Request {
  user?: User;
  patient?: Patient;
  doctor?: Doctor;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required. Please sign in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User not found or session invalid.' });
      return;
    }
    req.user = user;
    if (user.role === 'patient') {
      req.patient = db.getPatientByUserId(user._id);
    } else if (user.role === 'doctor') {
      req.doctor = db.getDoctors().find(
        d => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id
      );
    }
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired access token.' });
  }
}

export function optionalAuthenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.findUserById(decoded.id);
    if (user) {
      req.user = user;
      if (user.role === 'patient') {
        req.patient = db.getPatientByUserId(user._id);
      } else if (user.role === 'doctor') {
        req.doctor = db.getDoctors().find(
          d => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id
        );
      }
    }
  } catch {
    // Optional token, continue without blocking
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Requires [${roles.join(', ')}] permissions.` });
      return;
    }
    next();
  };
}
