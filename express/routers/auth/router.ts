import { NextFunction, Request, Response } from "express";
import prisma from "../../../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRequest } from "../../../common";

export async function signIn(req: Request, res: Response, next: NextFunction) {
  const { id, password, deviceId } = req.body;

  // запрос bearer токена по id и паролю

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
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // const {} = req.cookies;

  // Обновление bearer токена по refresh токену

  res.status(204);
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  // id - номер телефона или email
  const { id, password } = req.body;

  // регистрация нового пользователя
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

export async function logout(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  // выйти из системы
  // После выхода необходимо заблокировать текущие токены пользователя( методы с
  // этими токена больше не должны срабатывать). При следующем входе,
  // пользователь должен получить новую пару токенов, отличную от тех, которые были
  // при выходе.
  // Старый должен перестать работать;

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
