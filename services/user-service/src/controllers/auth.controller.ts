import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { z } from 'zod';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecret', {
    expiresIn: '30d',
  });
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  role: z.enum(['learner', 'instructor', 'admin']).optional(),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = registerSchema.parse(req.body);

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      email,
      password_hash: password,
      full_name,
      role: role || 'learner'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        token: generateToken(user._id.toString(), user.role)
      });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data', error });
  }
};

export const authUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await (user as any).matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        token: generateToken(user._id.toString(), user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
