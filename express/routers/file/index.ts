import express from "express";
import multer from "multer";
import { get, getList, update, upload, download, remove } from "./router";
import { checkAccessToken } from "../../helpers";

const router = express.Router();

export const multerUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (_, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 52428800 },
});

router.get("/list", checkAccessToken, getList);
router.get("/download/:id", checkAccessToken, download);
router.put("/update/:id", checkAccessToken, update);
router.post("/upload", checkAccessToken, upload);
router.delete("/delete/:id", checkAccessToken, remove);
router.get("/:id", checkAccessToken, get);

export { router };
