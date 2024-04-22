import express from "express";
import { get, getList, update, upload, download, remove } from "./router";
import { checkAccessToken, validation } from "../../helpers";
import { GetFileInfoDto } from "../../../common/dtos/file/get-file-info.dto";
import { DeleteFileDto } from "../../../common/dtos/file/delete-file.dto";
import { UpdateFileDto } from "../../../common/dtos/file/update-file.dto";
import { DownloadFileDto } from "../../../common/dtos/file/download-file.dto";
import { GetFilesListDto } from "../../../common/dtos/file/get-files-list.dto";

const router = express.Router();

router.get(
  "/list",
  validation(GetFilesListDto, "query"),
  checkAccessToken,
  getList,
);

router.get(
  "/download/:id",
  validation(DownloadFileDto, "query"),
  checkAccessToken,
  download,
);

router.put(
  "/update/:id",
  validation(UpdateFileDto, "query"),
  checkAccessToken,
  update,
);

router.post("/upload", checkAccessToken, upload);

router.delete(
  "/delete/:id",
  validation(DeleteFileDto, "query"),
  checkAccessToken,
  remove,
);

router.get("/:id", validation(GetFileInfoDto, "query"), checkAccessToken, get);

export { router };
