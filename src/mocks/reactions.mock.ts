import { AuthPayload } from '@auth/interfaces/auth.interfaces';
import { ICommentDocument, ICommentNameList } from '@comments/interfaces/comments.interfaces';
import { IJWT } from '@mocks/auth.mock';
import { IReactionDocument, IReactions } from '@reactions/interfaces/reactions.interfaces';
import { Response } from 'express';

export interface IBody {
  comment?: string;
  postId?: string;
  postReactions?: IReactions;
  previousReaction?: string;
  profilePicture?: string;
  type?: string;
  userTo?: string;
}

export interface IParams {
  commentId?: string;
  page?: string;
  postId?: string;
  postReactions?: string;
  previousReaction?: string;
  reactionId?: string;
  username?: string;
}

export const reactionMockRequest = (sessionData: IJWT, body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({
  body,
  currentUser,
  params,
  session: sessionData
});

export const reactionMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export const reactionData: IReactionDocument = {
  _id: '6064861bc25eaa5a5d2f9bf4',
  username: 'Jane',
  postId: '6027f77087c9d9ccb1555268',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  comment: 'This is a comment',
  createdAt: new Date(),
  userTo: '60263f14648fed5246e322d9',
  type: 'love'
} as IReactionDocument;

export const commentsData: ICommentDocument = {
  _id: '6064861bc25eaa5a5d2f9bf4',
  username: 'Jane',
  avatarColor: '#9c27b0',
  postId: '6027f77087c9d9ccb1555268',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  comment: 'This is a comment',
  createdAt: new Date(),
  userTo: '60263f14648fed5246e322d9'
} as unknown as ICommentDocument;

export const commentNames: ICommentNameList = {
  count: 1,
  names: ['Jane']
};
