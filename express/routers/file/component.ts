import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { FileRepository } from "../../../prisma/repositories";
import { isFileExists } from "../../../utils";
import { getFilePath, uploadFile } from "./helpers";
import { MULTER_MAX_FILE_NAME_LENGTH } from "../../../constants";

export async function get(id: number, userId: number) {
  const file = await FileRepository.getFile(id, userId);
  if (!file) {
    throw new Error("File was not found");
  }

  const filePath = getFilePath(file);
  if (!(await isFileExists(filePath))) {
    throw new Error("File is not exists");
  }

  return { ...file, size: file.size.toString() };
}

export async function getList(userId: number, list_size: number, page: number) {
  const files = await FileRepository.getList(userId, list_size, page);

  return files.map((f) => ({ ...f, size: f.size.toString() }));
}

export async function update(
  req: Request,
  res: Response,
  id: number,
  userId: number,
) {
  const oldFile = await FileRepository.getFile(id, userId);
  if (!oldFile) {
    throw new Error("Old file was not found");
  }

  const oldFilePath = getFilePath(oldFile);
  if (!(await isFileExists(oldFilePath))) {
    throw new Error("Old file is not exists");
  }

  const newFile = await uploadFile(req, res);
  if (!newFile) {
    throw new Error("Error uploading new file");
  }

  await fs.promises.unlink(oldFilePath);

  const ext = path.extname(newFile.originalname).split(".")[1];

  await FileRepository.update(
    id,
    `${newFile.filename.slice(0, MULTER_MAX_FILE_NAME_LENGTH)}.${ext}`,
    ext,
    newFile.mimetype,
    newFile.size,
  );
}

export async function upload(req: Request, res: Response, userId: number) {
  const file = await uploadFile(req, res);
  if (!file) {
    throw new Error("Error uploading file");
  }

  await FileRepository.create(
    userId,
    file.filename,
    path.extname(file.originalname).split(".")[1],
    file.mimetype,
    file.size,
  );
}

export async function remove(id: number, userId: number) {
  const file = await FileRepository.getFile(id, userId);
  if (!file) {
    throw new Error("File was not found");
  }

  const filePath = getFilePath(file);
  if (!filePath) {
    throw new Error("File is not exists");
  }

  await fs.promises.unlink(filePath);
  await prisma.file.delete({ where: { id } });
}
