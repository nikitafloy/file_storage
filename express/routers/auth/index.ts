import express from "express";

import { signIn, updateToken, signUp, logout } from "./router";
import { validation } from "../../helpers";
import { SignupDto } from "../../../common/dtos/auth/signup.dto";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signin/new_token", updateToken);
router.post("/signup", validation(SignupDto), signUp);
router.get("/logout", logout);

export { router };
