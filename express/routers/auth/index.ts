import express from "express";

import { signIn, updateToken, signUp, logout } from "./router";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signin/new_token", updateToken);
router.post("/signup", signUp);
router.get("/logout", logout);

export { router };
