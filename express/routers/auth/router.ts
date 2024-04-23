import { Request, Response } from "express";
import prisma from "../../../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UpdateTokenDto, UserRequest } from "../../../common";

export async function signIn(req: Request, res: Response) {
  const { id, password, deviceId } = req.body;

  const user = await prisma.user.findFirst({ where: { id } });
  if (!user) {
    return res.status(400).send({ success: false, message: "User not found" });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res
      .status(400)
      .send({ success: false, message: "Passwords do not match" });
  }

  const { userId } = user;

  const session = await prisma.userSessions
    .create({ data: { userId, deviceId } })
    .catch((err) => {
      console.error(err);
    });

  if (!session) {
    return res.status(400).send({
      success: false,
      message: "User with this session already exists",
    });
  }

  const tokenPayload = { userId, session: session.id };

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET_ACCESS as string,
    { expiresIn: "10m" },
  );

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET_REFRESH as string,
  );

  res
    .status(200)
    .json({ success: true, message: { accessToken, refreshToken } });
}

export async function updateToken(
  req: UserRequest & { body: UpdateTokenDto },
  res: Response,
) {
  const { refreshToken } = req.body;

  try {
    jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH as string,
    ) as jwt.JwtPayload;
  } catch (err) {
    return res.status(400).send({ success: false, message: "Invalid token" });
  }

  const { exp, iat, ...tokenPayload } = jwt.decode(
    refreshToken,
  ) as jwt.JwtPayload;

  if (!iat) {
    throw new Error("User iat is not provided");
  }

  const session = await prisma.userSessions.findFirst({
    where: {
      id: tokenPayload.session,
      OR: [
        { lastLogoutAt: null },
        { lastLogoutAt: { lte: new Date(iat * 1000) } },
      ],
    },
  });

  if (!session) {
    return res.status(400).send({
      success: false,
      message: "User with this session is not exists or expired",
    });
  }

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET_ACCESS as string,
    { expiresIn: "10m" },
  );

  res.status(200).json({ success: true, accessToken });
}

export async function signUp(req: Request, res: Response) {
  const { id, password } = req.body;

  const user = await prisma.user.findFirst({ where: { id } });
  if (user) {
    return res
      .status(400)
      .send({ success: false, message: "User already exists" });
  }

  await prisma.user.create({
    data: {
      id,
      password: await bcrypt.hash(password, 10),
    },
  });

  res.status(204).send();
}

export async function logout(req: UserRequest, res: Response) {
  await prisma.userSessions.update({
    where: {
      id: req.user!.session,
    },
    data: {
      lastLogoutAt: new Date(),
    },
  });

  return res.status(204).send();
}
