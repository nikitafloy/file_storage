import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function getInfo(
  req: Request & { user?: string | jwt.JwtPayload },
  res: Response,
  next: NextFunction,
) {
  // возвращает id пользователя
  if (!req.user || typeof req.user === "string") {
    return res.status(400);
  }

  res.status(200).json({ success: true, message: { userId: req.user.userId } });
}
