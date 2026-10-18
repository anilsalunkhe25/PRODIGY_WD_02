import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';

const router = Router();
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

router.post('/login', async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Enter a valid email and password.' });
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({ email }).select('+password');
    const validPassword = user ? await bcrypt.compare(parsed.data.password, user.password) : false;

    if (!user || !validPassword) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const token = jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET,
      { subject: user.id, expiresIn: '8h' },
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
