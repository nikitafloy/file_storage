import { Response } from "express";
import { UserRequest } from "../../../common";

export async function getInfo(req: UserRequest, res: Response) {
  res
    .status(200)
    .json({ success: true, message: { userId: req.user!.userId } });
}
