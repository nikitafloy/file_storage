import { NextFunction, Response } from "express";
import { UserRequest } from "../../../common";

export async function getInfo(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  // возвращает id пользователя
  res
    .status(200)
    .json({ success: true, message: { userId: req.user!.userId } });
}
