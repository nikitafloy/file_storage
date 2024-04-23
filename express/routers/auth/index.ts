import express from "express";

import { signIn, updateToken, signUp, logout } from "./controller";
import { checkAccessToken, validation } from "../../middleware";
import { SignupDto, SigninDto, UpdateTokenDto } from "../../../common";
import { getInfo } from "../user/router";

const router = express.Router();

router.post(
  "/signin",
  validation([{ Dto: SigninDto, reqType: "body" }]),
  signIn,
);
router.post(
  "/signin/new_token",
  validation([{ Dto: UpdateTokenDto, reqType: "body" }]),
  updateToken,
);
router.post(
  "/signup",
  validation([{ Dto: SignupDto, reqType: "body" }]),
  signUp,
);
router.get("/info", checkAccessToken, getInfo);
router.get("/logout", checkAccessToken, logout);

export { router };
