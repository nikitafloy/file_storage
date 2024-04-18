import express from "express";

import { get, getList, update, upload, download, remove } from "./router";

const router = express.Router();

router.get("/:id", get);
router.get("/list", getList);
router.put("/update/:id", update);
router.post("/upload", upload);
router.get("/download/:id", download);
router.delete("/delete/:id", remove);

export { router };
