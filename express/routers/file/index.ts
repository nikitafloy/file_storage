import express from "express";
import multer from "multer";
import { get, getList, update, upload, download, remove } from "./router";
import { checkAccessToken } from "../../helpers";

const router = express.Router();

const multerUpload = multer({
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

router.get("/:id", get);
router.get("/list", getList);
router.put("/update/:id", update);
router.post("/upload", checkAccessToken, multerUpload.single("file"), upload);
router.get("/download/:id", download);
router.delete("/delete/:id", remove);

export { router };
