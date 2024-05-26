const express = require("express");

const adminController = require("../providers/admin.js");
const auth = require("../middleWare/auth.js");
const router = express.Router();

router.get("/getAllUsers", auth, adminController.getAllUsers);
router.post("/verifyUser", auth, adminController.updateUserStatus);
router.post("/verifyPost", auth, adminController.verifyPost);
router.put('/deleteUser', auth, adminController.deleteUser)
module.exports = router;
