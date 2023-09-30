import { Request, Response, NextFunction } from 'express';
import { IMiddleWare } from './middleware.interface';
import jsonwebtoken, { JwtPayload, VerifyErrors } from 'jsonwebtoken'; // Import JwtPayload

// Define an interface for the JWT payload
interface CustomJwtPayload extends JwtPayload {
  email: string;
}

export class AuthMiddleware implements IMiddleWare {
  constructor(private secret: string) {}

  execute(req: Request, res: Response, next: NextFunction): void {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      jsonwebtoken.verify(token, this.secret, (err, payload) => { // Specify the type of payload
        if (err) {
          next();
        } else if (payload as CustomJwtPayload) {
          req.user = (payload as CustomJwtPayload).email;
          // console.log('req.user', req.user);
          
          next();
        }
      });
    } else {
      next(); // You should call next() only once in the else block
    }
  }
}
