import multer from "multer";

export const multerUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (_, file, cb) {
      cb(
        null,
        `${Buffer.from(`${Date.now()}-${file.originalname}`, "latin1").toString(
          "utf8",
        )}`,
      );
    },
  }),
  limits: { fileSize: 52428800 },
});
