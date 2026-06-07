import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Session from '../models/Session.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, targetExam } = req.body;

    if (!name || !email || !password || !targetExam) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, targetExam });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      targetExam: user.targetExam,
      streak: user.streak,
      token: signToken(user._id),
    });
  } catch (err) {
    return next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      targetExam: user.targetExam,
      streak: user.streak,
      token: signToken(user._id),
    });
  } catch (err) {
    return next(err);
  }
};

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeJSON());
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, targetExam } = req.body;
  if (name) req.user.name = name;
  if (targetExam) req.user.targetExam = targetExam;
  await req.user.save();
  res.json(req.user.toSafeJSON());
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Both old and new passwords are required');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(oldPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await Session.deleteMany({ userId: req.user._id });
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: 'Account deleted' });
});

export const googleAuth = async (req, res, next) => {
  try {
    const { credential, targetExam } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ message: 'Google sign-in is not configured on the server' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res
        .status(401)
        .json({ message: 'Invalid Google token', hint: verifyErr.message });
    }

    const { sub: googleId, email, name, picture } = payload;
    if (!email) {
      return res
        .status(400)
        .json({ message: 'Google account has no email on file' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: null,
        googleId,
        avatar: picture || '',
        authProvider: 'google',
        targetExam: ['NTS', 'GAT', 'MDCAT', 'CSS/PMS'].includes(targetExam)
          ? targetExam
          : 'NTS',
      });
    } else {
      let dirty = false;
      if (!user.googleId) {
        user.googleId = googleId;
        dirty = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        dirty = true;
      }
      if (user.authProvider === 'local') {
        user.authProvider = 'google';
        dirty = true;
      }
      if (dirty) await user.save();
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
      targetExam: user.targetExam,
      streak: user.streak,
      token: signToken(user._id),
    });
  } catch (err) {
    return next(err);
  }
};
