import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import jwt, { VerifyErrors } from "jsonwebtoken";
import prisma from "../prisma";

export function validation(Dto: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const params = { ...req.query, ...req.params, ...req.body };

    const instanceDto = new Dto();
    for (const key of Object.keys(params)) {
      instanceDto[key] = params[key];
    }

    const errors = await validate(instanceDto);

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

export async function checkAccessToken(
  req: Request & { user?: string | jwt.JwtPayload },
  res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader?.split("Bearer ")[1];

  if (!token) {
    return res
      .status(401)
      .send({ success: false, message: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET_ACCESS as string);

    if (!req.user || typeof req.user === "string") {
      return res.status(400);
    }

    if (!req.user.iat) {
      return res.status(400);
    }

    const session = await prisma.userSessions.findFirst({
      where: {
        id: req.user.session,
        OR: [
          { lastLogoutAt: null },
          { lastLogoutAt: { lte: new Date(req.user.iat * 1000) } },
        ],
      },
    });

    if (!session) {
      return res.status(400).send({
        success: false,
        message: "User with this session is not exists or expired",
      });
    }

    next();
  } catch (err) {
    console.error(err);

    if ((err as VerifyErrors).message === "jwt expired") {
      const oldTokenPayload = jwt.decode(token);

      if (!oldTokenPayload || typeof oldTokenPayload === "string") {
        return res
          .status(400)
          .send({ success: false, message: "Can not update token" });
      }

      const { exp, iat, ...tokenPayload } = oldTokenPayload;

      const newToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET_ACCESS as string,
        { expiresIn: "10m" },
      );

      res.cookie("Authorization", `Bearer ${newToken}`);

      req.user = jwt.verify(newToken, process.env.JWT_SECRET_ACCESS as string);

      return next();
    }

    return res
      .status(400)
      .send({ success: false, message: "Token not verified" });
  }
}
