import { Request, Response } from "express";
import { multerUpload } from "../../multer";

export async function uploadFile(req: Request, res: Response) {
  let file: Express.Multer.File | undefined;

  try {
    file = await new Promise((resolve, reject) => {
      multerUpload.single("file")(req, res, function (err) {
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
