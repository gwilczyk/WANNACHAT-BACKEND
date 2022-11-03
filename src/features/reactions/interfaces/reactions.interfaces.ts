import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface IQueryReaction {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
}

export interface IRemovePostReactionFromCache {
  postId: ObjectId | string;
  postReactions: IReactions;
  username: string;
}

export interface ISavePostReactionToCache {
  postId: ObjectId | string;
  postReactions: IReactions;
  previousReaction: string;
  reaction: IReactionDocument;
  type: string;
}

export interface IReaction {
  senderName: string;
  type: string;
}

export interface IReactionDocument extends Document {
  _id?: string | ObjectId;
  avataColor: string;
  comment?: string;
  createdAt?: Date;
  postId: string;
  profilePicture: string;
  type: string;
  username: string;
  userTo?: string | ObjectId;
}

export interface IReactionJob {
  postId: string;
  previousReaction: string;
  reactionObject?: IReactionDocument;
  type?: string;
  userFrom?: string;
  username: string;
  userTo?: string;
}

export interface IReactions {
  angry: number;
  happy: number;
  like: number;
  love: number;
  sad: number;
  wow: number;
}
