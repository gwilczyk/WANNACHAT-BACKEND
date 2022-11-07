import { ICommentDocument } from '@comments/interfaces/comments.interfaces';
import mongoose, { model, Model, Schema } from 'mongoose';

const commentSchema: Schema = new Schema({
  avataColor: { type: String },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  profilePicture: { type: String },
  username: { type: String }
});

const CommentsModel: Model<ICommentDocument> = model<ICommentDocument>('Comment', commentSchema, 'Comment');
export { CommentsModel };
