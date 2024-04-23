import express from "express";
import { getInfo } from "./controller";
import { checkAccessToken } from "../../middleware";

const router = express.Router();

router.get("/info", checkAccessToken, getInfo);

export { router };
