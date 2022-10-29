import { Signup } from '@auth/controllers/signup.controller';
import * as cloudinaryUpload from '@globals/helpers/cloudinary-upload';
import { CustomError } from '@globals/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from '@mocks/auth.mock';
import { authService } from '@services/db/auth.services';
import { UserCache } from '@services/redis/user.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');
jest.mock('@globals/helpers/cloudinary-upload');

describe('Signup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw "Username is a required field" error with statusCode 400 if username is empty', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'jane@mail.com',
        password: 'P4ssword',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw "Invalid username" error with statusCode 400 if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'abc',
        email: 'abc@mail.com',
        password: 'P4ssword',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw "Invalid username" error with statusCode 400 if username length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'abcdefghijklmnop',
        email: 'abcdefghijklmnop@mail.com',
        password: 'P4ssword',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw "Email is a required field" error with statusCode 400 if email is empty', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'jane',
        email: '',
        password: 'P4ssword',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw "Email must be valid" error with statusCode 400 if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'jane',
        email: 'not valid email',
        password: 'P4ssword',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw "Password is a required field" error with statusCode 400 if password is empty', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'jane',
        email: 'jane@mail.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw "Invalid password" error with statusCode 400 if password length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'jane',
        email: 'jane@mail.com',
        password: 'P4ssw',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid password" error with statusCode 400 if password length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'jane',
        email: 'jane@mail.com',
        password: 'P4sswordTooLong',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid credentials" error with statusCode 400 if user already exists', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'jane',
        email: 'jane@mail.com',
        password: 'P4ssword',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByUsernameOrEmail').mockResolvedValue(authMock);

    Signup.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'jane',
        email: 'jane@mail.com',
        password: 'P4ssword',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(cloudinaryUpload, 'uploads').mockImplementation((): any => Promise.resolve({ version: '123123123', public_id: '123456' }));
    await Signup.prototype.create(req, res);

    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
