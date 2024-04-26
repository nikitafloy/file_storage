import { NextFunction, Request, Response } from "express";
import { UpdateTokenDto, UserRequest } from "../../../common";
import * as component from "./component";

export async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, password, deviceId } = req.body;

    const { accessToken, refreshToken } = await component.signIn(
      id,
      password,
      deviceId,
    );

    res
      .status(200)
      .json({ success: true, message: { accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

export async function updateToken(
  req: UserRequest & { body: UpdateTokenDto },
  res: Response,
  next: NextFunction,
) {
  try {
    const { refreshToken } = req.body;

    const accessToken = await component.updateToken(refreshToken);

    res.status(200).json({ success: true, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, password } = req.body;

    await component.signUp(id, password);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = req.user!.session;

    await component.logout(session);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
