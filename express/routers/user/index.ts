import express from "express";

import { getInfo } from "./router";

const router = express.Router();

router.post("/info", getInfo);

export { router };
