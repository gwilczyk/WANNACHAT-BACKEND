import { IUserDocument } from '@user/interfaces/user.interfaces';
import mongoose, { model, Model, Schema } from 'mongoose';

const userSchema: Schema = new Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },
  bgImageId: { type: String, default: '' },
  bgImageVersion: { type: String, default: '' },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  location: { type: String, default: '' },
  notifications: {
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true }
  },
  postsCount: { type: Number, default: 0 },
  profilePicture: { type: String, default: '' },
  quote: { type: String, default: '' },
  school: { type: String, default: '' },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  work: { type: String, default: '' }
});

const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'User');

export { UserModel };
