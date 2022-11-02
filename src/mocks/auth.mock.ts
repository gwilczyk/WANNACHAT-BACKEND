import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interfaces';
import { Response } from 'express';

export interface IAuthMock {
  _id?: string;
  avatarColor?: string;
  avatarImage?: string;
  createdAt?: Date | string;
  comments?: boolean;
  cpassword?: string;
  currentPassword?: string;
  email?: string;
  facebook?: string;
  follows?: boolean;
  instagram?: string;
  location?: string;
  messages?: boolean;
  newPassword?: string;
  password?: string;
  quote?: string;
  reactions?: boolean;
  school?: string;
  twitter?: string;
  uId?: string;
  username?: string;
  work?: string;
  youtube?: string;
}

export const signupMockData = {
  _id: '605727cd646eb50e668a4e13',
  about: '',
  avatarColor: '#ff9800',
  bgImageId: '',
  bgImageVersion: '',
  birthday: { month: '', day: '' },
  blocked: [],
  blockedBy: [],
  createdAt: new Date(),
  email: 'jane@test.com',
  followersCount: 0,
  followingCount: 0,
  gender: '',
  notifications: { messages: true, reactions: true, comments: true, follows: true },
  password: 'P4ssword',
  placesLived: [],
  postCount: 0,
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13',
  quotes: '',
  relationship: '',
  school: [],
  uId: '92241616324557172',
  username: 'Jane',
  work: []
};

export interface IJWT {
  jwt?: string;
}

export const authUserPayload: AuthPayload = {
  avatarColor: '#9c27b0',
  email: 'jane@mail.com',
  iat: 12345,
  uId: '1621613119252066',
  userId: '60263f14648fed5246e322d9',
  username: 'Jane'
};

export const authMock = {
  _id: '60263f14648fed5246e322d3',
  avatarColor: '#9c27b0',
  createdAt: '2022-08-31T07:42:24.451Z',
  email: 'jane@mail.com',
  uId: '1621613119252066',
  username: 'Jane',
  comparePassword: () => false,
  save: () => {}
} as unknown as IAuthDocument;

export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: AuthPayload | null, params?: any) => ({
  body,
  currentUser,
  params,
  session: sessionData
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
