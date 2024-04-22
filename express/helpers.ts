import { Request, Response, NextFunction, RequestHandler } from "express";
import { validate } from "class-validator";
import jwt, { VerifyErrors } from "jsonwebtoken";
import prisma from "../prisma";
import { UserRequest } from "../common/interfaces/express-user-request.interface";
import { plainToInstance } from "class-transformer";

export function validation(Dto: any, reqType: "query" | "params" | "body") {
  return async (req: Request, res: Response, next: NextFunction) => {
    req[reqType] = plainToInstance(Dto, req[reqType]);

    const errors = await validate(req[reqType]);

    if (errors.length > 0) {
      return res.status(400).send({
        success: false,
        errors: errors
          .map((e) => e.constraints && Object.values(e.constraints).join(", "))
          .filter(Boolean)
          .join(", "),
      });
    }

    next();
  };
}

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

      if (err.message === "jwt expired") {
        const oldTokenPayload = jwt.decode(token);
        if (!oldTokenPayload || typeof oldTokenPayload === "string") {
          throw new Error("Can not update token");
        }

        const { exp, iat, ...tokenPayload } = oldTokenPayload;

        const newToken = jwt.sign(
          tokenPayload,
          process.env.JWT_SECRET_ACCESS as string,
          { expiresIn: "10m" },
        );

        res.cookie("Authorization", `Bearer ${newToken}`);

        req.user = jwt.verify(
          newToken,
          process.env.JWT_SECRET_ACCESS as string,
        ) as jwt.JwtPayload;

        next();
        return;
      }

      throw new Error("Token not verified");
    }
  } catch (err) {
    next(err);
  }
};

export function isVerifyErrors(error: any): error is VerifyErrors {
  return "message" in error;
}
