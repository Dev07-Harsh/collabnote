import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/user.js';

const router = express.Router();
const schema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ message: 'Email already in use' });

    user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;