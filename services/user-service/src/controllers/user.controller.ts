import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const getMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret') as { id: string, role: string };

    const user = await User.findById(decoded.id).select('-password_hash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: (user as any).createdAt
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret') as { id: string };

        const { full_name, bio, avatar_url } = req.body;
        const user = await User.findByIdAndUpdate(decoded.id, { full_name, bio, avatar_url }, { new: true });
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user._id });
    } catch (error) {
        res.status(400).json({ message: 'Error updating profile' });
    }
};
