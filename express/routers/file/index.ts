import express from "express";
import { checkAccessToken, validation } from "../../middleware";
import { get, getList, update, upload, download, remove } from "./controller";
import {
  GetFileInfoDto,
  DeleteFileDto,
  UpdateFileDto,
  DownloadFileDto,
  GetFilesListDto,
} from "../../../common";

const router = express.Router();

router.get(
  "/list",
  validation([{ Dto: GetFilesListDto, reqType: "query" }]),
  checkAccessToken,
  getList,
);

router.get(
  "/download/:id",
  validation([{ Dto: DownloadFileDto, reqType: "params" }]),
  checkAccessToken,
  download,
);

router.put(
  "/update/:id",
  validation([{ Dto: UpdateFileDto, reqType: "params" }]),
  checkAccessToken,
  update,
);

router.post("/upload", checkAccessToken, upload);

router.delete(
  "/delete/:id",
  validation([{ Dto: DeleteFileDto, reqType: "params" }]),
  checkAccessToken,
  remove,
);

router.get(
  "/:id",
  validation([{ Dto: GetFileInfoDto, reqType: "params" }]),
  checkAccessToken,
  get,
);

export { router };
