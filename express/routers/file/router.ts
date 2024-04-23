import { Response } from "express";
import path from "node:path";
import { isFileExists } from "../../../utils";
import fs from "node:fs";
import { uploadFile } from "./helpers";
import {
  UserRequest,
  GetFilesListDto,
  UpdateFileDto,
  GetFileInfoDto,
  DownloadFileDto,
  DeleteFileDto,
} from "../../../common";
import {
  MULTER_DESTINATION_FOLDER,
  MULTER_MAX_FILE_NAME_LENGTH,
} from "../../../constants";

export async function get(
  req: UserRequest & { params: GetFileInfoDto },
  res: Response,
) {
  const { id } = req.params;

  const file = await prisma.file.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!file) {
    return res
      .status(400)
      .send({ success: false, message: "File was not found" });
  }

  const filePath = path.join(`.${MULTER_DESTINATION_FOLDER}/${file.name}`);

  if (!(await isFileExists(filePath))) {
    return res
      .status(400)
      .send({ success: false, message: "File is not exists" });
  }

  res.status(200).json({
    success: true,
    message: { file: { ...file, size: file.size.toString() } },
  });
}

export async function getList(
  req: UserRequest & { query: GetFilesListDto },
  res: Response,
) {
  const list_size = req.query.list_size || 10;
  const page = req.query.page || 1;

  const files = await prisma.file.findMany({
    where: { userId: req.user!.userId },
    skip: list_size * (page - 1),
    take: list_size,
  });

  res.status(200).json({
    success: true,
    message: { files: files.map((f) => ({ ...f, size: f.size.toString() })) },
  });
}

export async function update(
  req: UserRequest & { params: UpdateFileDto },
  res: Response,
) {
  const { id } = req.params;

  const oldFile = await prisma.file.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!oldFile) {
    return res
      .status(400)
      .send({ success: false, message: "Old file was not found" });
  }

  const filePath = path.join(`.${MULTER_DESTINATION_FOLDER}/${oldFile.name}`);

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

  const ext = path.extname(newFile.originalname).split(".")[1];

  await prisma.file.update({
    where: { id },
    data: {
      name: `${newFile.filename.slice(0, MULTER_MAX_FILE_NAME_LENGTH)}.${ext}`,
      ext,
      mime_type: newFile.mimetype,
      size: newFile.size,
    },
  });

  res.status(204).send();
}

export async function upload(req: UserRequest, res: Response) {
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
  req: UserRequest & { params: DownloadFileDto },
  res: Response,
) {
  const { id } = req.params;

  const file = await prisma.file.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!file) {
    return res
      .status(400)
      .send({ success: false, message: "File was not found" });
  }

  const filePath = path.join(`.${MULTER_DESTINATION_FOLDER}/${file.name}`);

  if (!(await isFileExists(filePath))) {
    return res
      .status(400)
      .send({ success: false, message: "File is not exists" });
  }

  res.download(filePath);
}

export async function remove(
  req: UserRequest & { params: DeleteFileDto },
  res: Response,
) {
  const { id } = req.params;

  const file = await prisma.file.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!file) {
    return res
      .status(400)
      .send({ success: false, message: "File was not found" });
  }

  const filePath = path.join(`.${MULTER_DESTINATION_FOLDER}/${file.name}`);

  if (!(await isFileExists(filePath))) {
    return res
      .status(400)
      .send({ success: false, message: "File is not exists" });
  }

  await fs.promises.unlink(filePath);
  await prisma.file.delete({ where: { id } });

  res.status(204).send();
}
