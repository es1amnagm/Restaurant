const express = require("express");
const Router = express.Router();

const verifyToken = require('../MiddleWare/verifyToken');
const User = require("../Controller/usersController");

Router.route("/").get(verifyToken, User.getAllUsers)

Router.route('/login').get(User.logIn)

Router.route("/register").post(User.register);

Router.route("/:userId").get(User.getSingleUser).patch(User.updateUser).delete(User.deleteUser);

module.exports = Router;