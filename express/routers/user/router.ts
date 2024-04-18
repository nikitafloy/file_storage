import { NextFunction, Request, Response } from "express";

export async function getInfo(req: Request, res: Response, next: NextFunction) {
  // возвращает id пользователя

  res.status(200).json({ success: true, message: { bearer: "", refresh: "" } });
}
