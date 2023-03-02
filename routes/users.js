const express = require("express");
const passport = require("passport");
const users = require("../controllers/users");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

router.get("/register", users.renderRegisterForm)

router.post("/register", wrapAsync(users.userRegister));

router.get("/login", users.renderLoginForm)

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", keepSessionInfo: true }), users.userLogin)

router.get("/logout", users.userLogout)

module.exports = router;