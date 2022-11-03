import { IReactionDocument } from '@reactions/interfaces/reactions.interfaces';
import mongoose, { model, Model, Schema } from 'mongoose';

const reactionSchema: Schema = new Schema({
  avataColor: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  profilePicture: { type: String, default: '' },
  type: { type: String, default: '' },
  username: { type: String, default: '' }
});

const ReactionModel: Model<IReactionDocument> = model<IReactionDocument>('Reaction', reactionSchema, 'Reaction');

export { ReactionModel };
