import { RequestHandler } from "express";
import { UserRequest } from "../../common";
import jwt from "jsonwebtoken";
import prisma from "../../prisma";
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
      const user = jwt.verify(
        token,
        process.env.JWT_SECRET_ACCESS as string,
      ) as jwt.JwtPayload;

      if (!user.iat) {
        throw new Error("User iat is not provided");
      }

      const session = await prisma.userSessions.findFirst({
        where: {
          id: user.session,
          OR: [
            { lastLogoutAt: null },
            { lastLogoutAt: { lte: new Date(user.iat * 1000) } },
          ],
        },
      });

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
