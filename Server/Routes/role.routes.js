const express = require("express");
const { HOD } = require("../Controllers/role.Controller");
const RoleRouter = express.Router();

RoleRouter.get("/hod", HOD);

module.exports = RoleRouter;