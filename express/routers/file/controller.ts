import { NextFunction, Response } from "express";
import { getFile } from "../../../prisma/repositories";
import * as component from "./component";
import {
  UserRequest,
  GetFilesListDto,
  UpdateFileDto,
  GetFileInfoDto,
  DownloadFileDto,
  DeleteFileDto,
} from "../../../common";
import { getFilePath } from "./helpers";

export async function get(
  req: UserRequest & { params: GetFileInfoDto },
  res: Response,
  next: NextFunction,
) {
  try {
    const file = await component.get(req.params.id, req.user!.userId);

    res.status(200).json({
      success: true,
      message: { file },
    });
  } catch (err) {
    next(err);
  }
}

export async function getList(
  req: UserRequest & { query: GetFilesListDto },
  res: Response,
  next: NextFunction,
) {
  try {
    const list_size = req.query.list_size || 10;
    const page = req.query.page || 1;
    const userId = req.user!.userId;

    const files = await component.getList(userId, list_size, page);

    res.status(200).json({
      success: true,
      message: { files },
    });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: UserRequest & { params: UpdateFileDto },
  res: Response,
  next: NextFunction,
) {
  try {
    await component.update(req, res, req.params.id, req.user!.userId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function upload(
  req: UserRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await component.upload(req, res, req.user!.userId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function download(
  req: UserRequest & { params: DownloadFileDto },
  res: Response,
  next: NextFunction,
) {
  try {
    const file = await getFile(req.params.id, req.user!.userId);
    if (!file) {
      throw new Error("File was not found");
    }

    const filePath = getFilePath(file);
    if (!filePath) {
      throw new Error("File is not exists");
    }

    res.download(filePath);
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: UserRequest & { params: DeleteFileDto },
  res: Response,
) {
  await component.remove(req.params.id, req.user!.userId);

  res.status(204).send();
}
