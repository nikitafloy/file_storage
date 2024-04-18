import { NextFunction, Request, Response } from "express";

export async function signIn(req: Request, res: Response, next: NextFunction) {
  const { id, password } = req.body;

  // запрос bearer токена по id и паролю

  res.status(200).json({ success: true, message: { bearer: "" } });
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
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  // выйти из системы

  // После выхода необходимо заблокировать текущие токены пользователя( методы с
  // этими токена больше не должны срабатывать). При следующем входе,
  // пользователь должен получить новую пару токенов, отличную от тех, которые были
  // при выходе.

  // Старый должен перестать работать;
}
