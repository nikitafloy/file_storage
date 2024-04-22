import { NextFunction, Response } from "express";
import path from "node:path";
import { isFileExists } from "../../../utils";
import fs from "node:fs";
import { multerUpload } from "../../multer";
import { uploadFile } from "./helpers";
import { UserRequest } from "../../../common/interfaces/express-user-request.interface";

export async function get(req: UserRequest, res: Response, next: NextFunction) {
  const id = Number(req.params.id);

  const file = await prisma.file.findFirst({
    where: { id, userId: req.user!.sessionId },
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

  // вывод информации о выбранном файле

  res.status(200).json({
    success: true,
    message: { file: { ...file, size: file.size.toString() } },
  });
}

export async function getList(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  const list_size = req.params.list_size ? Number(req.params.list_size) : 10;
  const page = req.params.page ? Number(req.params.page) : 1;

  const files = await prisma.file.findMany({
    where: { userId: req.user!.userId },
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

export async function update(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  // обновление текущего документа на новый в базе и
  // локальном хранилище
  const id = Number(req.params.id);

  const oldFile = await prisma.file.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!oldFile) {
    return res
      .status(400)
      .send({ success: false, message: "Old file was not found" });
  }

  const filePath = path.join(`./uploads/${oldFile.name}`);

  if (!(await isFileExists(filePath))) {
    return res
      .status(400)
      .send({ success: false, message: "Old file is not exists" });
  }

  const newFile = await uploadFile(req, res);

  if (!newFile) {
    return res
      .status(400)
      .json({ success: false, message: "Error uploading new file" });
  }

  await fs.promises.unlink(filePath);

  // await fs.promises.rename(
  //   path.join(`./uploads/${newFile.filename}`),
  //   path.join(`./uploads/${oldFile.name}`),
  // );

  await prisma.file.update({
    where: { id },
    data: {
      name: newFile.filename,
      ext: path.extname(newFile.originalname).split(".")[1],
      mime_type: newFile.mimetype,
      size: newFile.size,
    },
  });

  res.status(204).send();
}

export async function upload(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  // добавление нового файла в систему и запись
  // параметров файла в базу: название, расширение, MIME type, размер, дата
  // Загрузки;

  const file = await uploadFile(req, res);

  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "Error uploading file" });
  }

  await prisma.file.create({
    data: {
      userId: req.user!.userId,
      name: file.filename,
      ext: path.extname(file.originalname).split(".")[1],
      mime_type: file.mimetype,
      size: file.size,
    },
  });

  res.status(204).send();
}

export async function download(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  // скачивание конкретного файла

  const file = await prisma.file.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user!.sessionId,
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

export async function remove(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  const id = Number(req.params.id);

  // удаляет документ из базы и локального
  // Хранилища

  const file = await prisma.file.findFirst({
    where: { id, userId: req.user!.sessionId },
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

  await fs.promises.unlink(filePath);
  await prisma.file.delete({ where: { id } });

  res.status(204).send();
}
