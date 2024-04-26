import { RequestHandler } from "express";
import { UserSessionsRepository } from "../../prisma/repositories";
import { UserRequest, verifyAccessToken } from "../../common";
import { isVerifyErrors } from "./helpers";

export const checkAccessToken: RequestHandler = async (
  req: UserRequest,
  res,
  next,
) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    const token = authorizationHeader?.split("Bearer ")[1];
    if (!token) {
      throw new Error("No token provided");
    }

    try {
      const user = verifyAccessToken(token);
      if (!user.iat) {
        throw new Error("User iat is not provided");
      }

      const session = await UserSessionsRepository.getActive(
        user.session,
        user.iat,
      );

      if (!session) {
        throw new Error("User with this session is not exists or expired");
      }

      req.user = user;

      next();
    } catch (err) {
      console.error(err);

      if (!isVerifyErrors(err)) {
        throw err;
      }

      throw new Error("Token not verified");
    }
  } catch (err) {
    next(err);
  }
};
