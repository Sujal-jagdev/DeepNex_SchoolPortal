const express = require('express');
const AdminRouter = express.Router();
const {
  GET_HODS,
  UPDATE_HOD,
  DELETE_HOD,
  GET_STUDENTS,
  UPDATE_STUDENT,
  DELETE_STUDENT,
  GET_TEACHERS,
  UPDATE_TEACHER,
  DELETE_TEACHER,
  GET_ADMINS,
  UPDATE_ADMIN,
  DELETE_ADMIN,
  GET_DEPARTMENTS
} = require('../Controllers/trusty.Controller');

// HOD routes
AdminRouter.get("/trusty/gethods", GET_HODS);
AdminRouter.put("/trusty/updatehod/:id", UPDATE_HOD);
AdminRouter.delete("/trusty/deletehod/:id", DELETE_HOD);

// Student routes
AdminRouter.get("/trusty/getstudents", GET_STUDENTS);
AdminRouter.put("/trusty/updatestudent/:id", UPDATE_STUDENT);
AdminRouter.delete("/trusty/deletestudent/:id", DELETE_STUDENT);

// Teacher routes
AdminRouter.get("/trusty/getteachers", GET_TEACHERS);
AdminRouter.put("/trusty/updateteacher/:id", UPDATE_TEACHER);
AdminRouter.delete("/trusty/deleteteacher/:id", DELETE_TEACHER);

// Admin routes
AdminRouter.get("/trusty/getadmins", GET_ADMINS);
AdminRouter.put("/trusty/updateadmin/:id", UPDATE_ADMIN);
AdminRouter.delete("/trusty/deleteadmin/:id", DELETE_ADMIN);

// Department routes
AdminRouter.get("/trusty/getdepartments", GET_DEPARTMENTS);

module.exports = AdminRouter;