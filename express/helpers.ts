import { Request, Response, NextFunction, RequestHandler } from "express";
import { validate, ValidationError } from "class-validator";
import jwt, { VerifyErrors } from "jsonwebtoken";
import prisma from "../prisma";
import { UserRequest } from "../common";
import { plainToInstance } from "class-transformer";

export function validation(
  validateData: { Dto: any; reqType: "query" | "params" | "body" }[],
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for await (const data of validateData) {
      const { Dto, reqType } = data;

      req[reqType] = plainToInstance(Dto, req[reqType]);

      await validate(req[reqType]).then((errs) => {
        if (!errs.length) {
          return;
        }

        errors.push(getAllConstraints(errs).join(", "));
      });
    }

    if (errors.length > 0) {
      return res.status(400).send({
        success: false,
        errors: errors.join(", "),
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

      throw new Error("Token not verified");
    }
  } catch (err) {
    next(err);
  }
};

function getAllConstraints(errors: ValidationError[]): string[] {
  const constraints: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      const constraintValues = Object.values(error.constraints);
      constraints.push(...constraintValues);
    }

    if (error.children) {
      const childConstraints = getAllConstraints(error.children);
      constraints.push(...childConstraints);
    }
  }

  return constraints;
}

export function isVerifyErrors(error: any): error is VerifyErrors {
  return "message" in error;
}
