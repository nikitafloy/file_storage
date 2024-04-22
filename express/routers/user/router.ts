import { NextFunction, Response } from "express";
import { ExpressRequestWithUser } from "../../../common/interfaces/express/request-with-user.interface";

export async function getInfo(
  req: ExpressRequestWithUser,
  res: Response,
  next: NextFunction,
) {
  // возвращает id пользователя
  res.status(200).json({ success: true, message: { userId: req.user.userId } });
}
