import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, minlength: 6, default: null },
    googleId: { type: String, default: null, index: true, sparse: true },
    avatar: { type: String, default: '' },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    targetExam: {
      type: String,
      enum: ['NTS', 'GAT', 'MDCAT', 'CSS/PMS'],
      default: 'NTS',
    },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    authProvider: this.authProvider,
    targetExam: this.targetExam,
    streak: this.streak,
    lastActive: this.lastActive,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
