import { AuthPayload } from '@auth/interfaces/auth.interfaces';
import { existingUser } from '@mocks/user.mock';
import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { Response } from 'express';
import mongoose from 'mongoose';

interface IParams {
  page?: string;
  postId?: string;
}

interface IBody {
  bgColor: string;
  feelings?: string;
  gifUrl?: string;
  image?: string;
  imgId?: string;
  imgVersion?: string;
  post?: string;
  privacy?: string;
  profilePicture?: string;
}

export const newPost: IBody = {
  bgColor: '#f44336',
  feelings: 'happy',
  gifUrl: '',
  image: '',
  imgId: '',
  imgVersion: '',
  post: 'How are you?',
  privacy: 'Public',
  profilePicture: 'http://place-hold.it/500x500'
};

export const postMockData: IPostDocument = {
  _id: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268'),
  avatarColor: existingUser.avatarColor,
  email: existingUser.email,
  profilePicture: existingUser.profilePicture,
  userId: existingUser._id,
  username: existingUser.username,
  bgColor: '#f44336',
  feelings: 'happy',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  post: 'How are you?',
  privacy: 'Public',
  commentsCount: 0,
  createdAt: new Date(),
  reactions: {
    like: 0,
    love: 0,
    happy: 0,
    wow: 0,
    sad: 0,
    angry: 0
  }
} as unknown as IPostDocument;

export const updatedPost = {
  bgColor: postMockData.bgColor,
  feelings: 'wow',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  post: postMockData.post,
  privacy: 'Private',
  profilePicture: postMockData.profilePicture
};

export const updatedPostWithImage = {
  bgColor: postMockData.bgColor,
  feelings: 'wow',
  gifUrl: '',
  image: '',
  imgId: '',
  imgVersion: '',
  post: 'Wonderful',
  privacy: 'Private',
  profilePicture: postMockData.profilePicture
};

export const postMockRequest = (body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({
  body,
  currentUser,
  params
});

export const postMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
