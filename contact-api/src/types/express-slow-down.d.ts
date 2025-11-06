declare module 'express-slow-down' {
  import { RequestHandler } from 'express';
  
  interface SlowDownOptions {
    windowMs?: number;
    delayAfter?: number;
    delayMs?: number;
    maxDelayMs?: number;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    skip?: (req: any, res: any) => boolean;
    keyGenerator?: (req: any, res: any) => string;
    headers?: boolean;
    store?: any;
  }
  
  function slowDown(options?: SlowDownOptions): RequestHandler;
  export = slowDown;
}