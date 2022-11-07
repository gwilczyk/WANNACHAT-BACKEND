import { IUserDocument } from '@user/interfaces/user.interfaces';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export interface IFollowers {
  userId: string;
}

export interface IFollowerDocument extends Document {
  _id: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  followeeId: mongoose.Types.ObjectId;
  followerId: mongoose.Types.ObjectId;
}

export interface IFollower {
  _id: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  followeeId?: IFollowerData;
  followerId?: IFollowerData;
}

export interface IFollowerData {
  _id?: mongoose.Types.ObjectId;
  avatarColor: string;
  followersCount: number;
  followingCount: number;
  postCount: number;
  profilePicture: string;
  uId: string;
  username: string;
  userProfile?: IUserDocument;
}

export interface IFollowerJob {
  followerDocumentId?: ObjectId;
  keyOne?: string;
  keyTwo?: string;
  username?: string;
}

export interface IBlockedUserJob {
  keyOne?: string;
  keyTwo?: string;
  type?: string;
}
