/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signin } from '@auth/controllers/signin.controller';
import { CustomError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { authMock, authMockRequest, authMockResponse } from '@mocks/auth.mock';
import { mergedAuthAndUserData } from '@mocks/user.mock';
import { authService } from '@services/db/auth.service';
import { userService } from '@services/db/user.service';
import { Request, Response } from 'express';

const EMAIL = 'jane@mail.com';
const PASSWORD = 'P4ssword';
const WRONG_EMAIL = 'not valid email';
const WRONG_PASSWORD = 'P4ssw';
const LONG_PASSWORD = 'P4sswordTooLong';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');

describe('Signin', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw "Email is a required field" error with statusCode 400 if email is empty', () => {
    const req: Request = authMockRequest({}, { email: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw "Email must be valid" error with statusCode 400 if email is not valid', () => {
    const req: Request = authMockRequest({}, { email: WRONG_EMAIL, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw "Password is a required field" error with statusCode 400 if password is empty', () => {
    const req: Request = authMockRequest({}, { email: EMAIL, password: '' }) as Request;
    const res: Response = authMockResponse();
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw "Invalid password" error with statusCode 400 if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { email: EMAIL, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid password" error with statusCode 400 if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { email: EMAIL, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid credentials" error with statusCode 400 if username does not exist', () => {
    const req: Request = authMockRequest({}, { email: EMAIL, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValueOnce(null as any);

    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByEmail).toHaveBeenCalledWith(Helpers.lowerCase(req.body.email));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should throw "Invalid credentials" error with statusCode 400 if password does not match', () => {
    const req: Request = authMockRequest({}, { email: EMAIL, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValueOnce(null as any);

    Signin.prototype.read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByEmail).toHaveBeenCalledWith(Helpers.lowerCase(req.body.email));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { email: EMAIL, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);

    await Signin.prototype.read(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: mergedAuthAndUserData,
      // user: authMock,
      token: req.session?.jwt
    });
  });
});
