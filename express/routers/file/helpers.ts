import { Request, Response } from "express";
import { multerUpload } from "../../multer";
import { MULTER_DESTINATION_FOLDER } from "../../../constants";
import { File } from "@prisma/client";

const singleMulterUpload = multerUpload.single("file");

export function getFilePath(file: File) {
  return `${MULTER_DESTINATION_FOLDER}/${file.name}`;
}

export async function uploadFile(req: Request, res: Response) {
  let file: Express.Multer.File | undefined;

  try {
    file = await new Promise((resolve, reject) => {
      singleMulterUpload(req, res, function (err) {
        if (err) {
          return reject(err);
        }

        resolve(req.file);
      });
    });
  } catch (err) {
    console.error(err);
  }

  return file;
}
