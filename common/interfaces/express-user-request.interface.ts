import { Request } from "express";
import jwt from "jsonwebtoken";

export interface UserRequest extends Request {
  user?: jwt.JwtPayload;
}
