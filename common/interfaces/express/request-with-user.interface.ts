import { Request } from "express";
import jwt from "jsonwebtoken";

export interface ExpressRequestWithUser extends Request {
  user: jwt.JwtPayload;
}
