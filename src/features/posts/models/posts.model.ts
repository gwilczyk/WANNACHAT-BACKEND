import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import mongoose, { model, Model, Schema } from 'mongoose';

const postSchema: Schema = new Schema({
  avatarColor: { type: String },
  bgColor: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  email: { type: String },
  feelings: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  post: { type: String, default: '' },
  privacy: { type: String, default: '' },
  profilePicture: { type: String },
  reactions: {
    angry: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    wow: { type: Number, default: 0 }
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  username: { type: String }
});

const PostModel: Model<IPostDocument> = model<IPostDocument>('Post', postSchema, 'Post');

export { PostModel };
