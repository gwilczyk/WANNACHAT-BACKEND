import { Signout } from '@auth/controllers/signout.controller';
import { authMockRequest, authMockResponse } from '@mocks/auth.mock';
import { Request, Response } from 'express';

const USERNAME = 'Jane';
const PASSWORD = 'P4ssword';
let req: Request;
let res: Response;

const setup = () => {
  req = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
  res = authMockResponse();
};

describe('Signout', () => {
  it('should set session to null', async () => {
    setup();
    await Signout.prototype.update(req, res);
    expect(req.session).toBeNull();
  });

  it('should send correct json response', async () => {
    setup();
    await Signout.prototype.update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logout successful',
      user: {},
      token: ''
    });
  });
});
