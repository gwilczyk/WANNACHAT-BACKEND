import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface ICommentDocument extends Document {
  _id?: string | ObjectId;
  avatarColor: string;
  comment: string;
  createdAt?: Date;
  postId: string;
  profilePicture: string;
  username: string;
  userTo?: string | ObjectId;
}

export interface ICommentJob {
  comment: ICommentDocument;
  postId: string;
  userFrom: string;
  username: string;
  userTo: string;
}

export interface ICommentNameList {
  count: number;
  names: string[];
}

export interface IQueryComment {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
}

export interface IQuerySort {
  createdAt?: number;
}
