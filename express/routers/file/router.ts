import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import path from "node:path";
import { isFileExists } from "../../../utils";

export async function get(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  // вывод информации о выбранном файле

  res.status(200).json({ success: true, message: { file: {} } });
}

export async function getList(
  req: Request & { user?: string | jwt.JwtPayload },
  res: Response,
  next: NextFunction,
) {
  const list_size = req.params.list_size ? Number(req.params.list_size) : 10;
  const page = req.params.page ? Number(req.params.page) : 1;

  if (!req.user || typeof req.user === "string") {
    return res.status(400);
  }

  const files = await prisma.file.findMany({
    where: { userId: req.user.userId },
    skip: list_size * (page - 1),
    take: list_size,
  });

  // выводит список файлов и их параметров из базы с
  // использованием пагинации с размером страницы, указанного в
  // передаваемом параметре list_size, по умолчанию 10 записей на страницу,
  // если параметр пустой. Номер страницы указан в параметре page, по
  // умолчанию 1, если не задан

  res.status(200).json({
    success: true,
    message: { files: files.map((f) => ({ ...f, size: f.size.toString() })) },
  });
}

export async function update(req: Request, res: Response, next: NextFunction) {
  // обновление текущего документа на новый в базе и
  // локальном хранилище

  res.status(200).json({ success: true, message: { files: {} } });
}

export async function upload(
  req: Request & { user?: string | jwt.JwtPayload },
  res: Response,
  next: NextFunction,
) {
  // добавление нового файла в систему и запись
  // параметров файла в базу: название, расширение, MIME type, размер, дата
  // Загрузки;

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "File is required" });
  }

  if (!req.user || typeof req.user === "string") {
    return res.status(400);
  }

  console.log(req.file);

  await prisma.file.create({
    data: {
      userId: req.user.userId,
      name: req.file.filename,
      ext: path.extname(req.file.originalname).split(".")[1],
      mime_type: req.file.mimetype,
      size: req.file.size,
    },
  });

  res.status(204).send();
}

export async function download(
  req: Request & { user?: string | jwt.JwtPayload },
  res: Response,
  next: NextFunction,
) {
  // скачивание конкретного файла
  if (!req.user || typeof req.user === "string") {
    return res.status(400);
  }

  const file = await prisma.file.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user.sessionId,
    },
  });

  if (!file) {
    return res
      .status(400)
      .send({ success: false, message: "File was not found" });
  }

  const filePath = path.join(`./uploads/${file.name}`);

  if (!(await isFileExists(filePath))) {
    return res
      .status(400)
      .send({ success: false, message: "File is not exists" });
  }

  res.download(filePath);
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  // удаляет документ из базы и локального
  // Хранилища

  res.status(204);
}
