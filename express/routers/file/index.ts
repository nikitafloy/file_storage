import express from "express";
import { get, getList, update, upload, download, remove } from "./router";
import { checkAccessToken } from "../../helpers";

const router = express.Router();

router.get("/list", checkAccessToken, getList);
router.get("/download/:id", checkAccessToken, download);
router.put("/update/:id", checkAccessToken, update);
router.post("/upload", checkAccessToken, upload);
router.delete("/delete/:id", checkAccessToken, remove);
router.get("/:id", checkAccessToken, get);

export { router };
