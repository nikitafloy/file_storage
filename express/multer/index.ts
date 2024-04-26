import multer from "multer";

import {
  MULTER_DESTINATION_FOLDER,
  MULTER_MAX_FILE_NAME_LENGTH,
  MULTER_MAX_FILE_SIZE,
} from "../../constants";
import path from "node:path";

export const multerUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, MULTER_DESTINATION_FOLDER);
    },
    filename: function (_, file, cb) {
      cb(
        null,
        `${Buffer.from(
          `${Date.now()}-${file.originalname.slice(
            0,
            MULTER_MAX_FILE_NAME_LENGTH,
          )}.${path.extname(file.originalname).split(".")[1]}`,
          "latin1",
        ).toString("utf8")}`,
      );
    },
  }),
  limits: { fileSize: MULTER_MAX_FILE_SIZE },
});
