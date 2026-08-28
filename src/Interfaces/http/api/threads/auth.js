import jwt from 'jsonwebtoken';
import config from '../../../../Commons/config.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) throw new AuthenticationError('Missing authentication');
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) throw new AuthenticationError('Invalid authentication');
    req.auth = { credentials: jwt.verify(token, config.auth.accessTokenKey) };
    next();
  } catch (error) {
    next(error instanceof AuthenticationError ? error : new AuthenticationError('Invalid access token'));
  }
};
export default authenticate;
