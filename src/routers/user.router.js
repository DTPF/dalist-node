const express = require("express");
const UserController = require("../controllers/user.controller");
const api = express.Router();
const md_auth = require("../middlewares/auth.middleware");

api
	.post("/init-get-user", [md_auth.checkJwt], UserController.initGetUser)

module.exports = api;