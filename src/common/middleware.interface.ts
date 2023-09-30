import { NextFunction, Request, Response } from 'express';

import '../types/express/index.d.ts';

export interface IMiddleWare {
  execute: (req: Request , res: Response, next: NextFunction) => void;
}