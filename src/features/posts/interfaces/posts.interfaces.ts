import { IReactions } from '@reactions/interfaces/reactions.interfaces';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export interface IPostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  username: string;
  email: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentsCount: number;
  imgVersion?: string;
  imgId?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
}

export interface IGetPostsQuery {
  _id?: ObjectId | string;
  gifUrl?: string;
  imgId?: string;
  username?: string;
}

export interface ISavePostToCache {
  createdPost: IPostDocument;
  currentUserId: string;
  key: ObjectId | string;
  uId: string;
}

export interface IPostJob {
  key?: string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}
