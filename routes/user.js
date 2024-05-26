const express = require("express");
const multer = require("multer");
const userController = require("../providers/user.js");
const auth = require("../middleWare/auth.js");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
// Define storage for uploaded files
const path = require("path");
cloudinary.config({
  cloud_name: "dtkbc49uz",
  api_key: "558461232623598",
  api_secret: "zyQToQyIW6wUP4Z9KGjVdesrIg8",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => {
      const ext = path.extname(file.originalname).slice(1); // Get file extension without dot
      return ext; // Return the file extension
    },
    public_id: (req, file) => {
      const name = path.basename(
        file.originalname,
        path.extname(file.originalname)
      );
      return name; // Return file name without extension
    },
  },
});
const upload = multer({ storage: storage });
const router = express.Router();

// user routes
router.post("/login", userController.login);
router.post("/signup", upload.single("file"), userController.createUser);
router.get("/getUser", auth, userController.getUserProfile);
router.get("/current", userController.getCurrentUser);
router.post(
  "/updateUser",
  upload.single("file"),
  auth,
  userController.updateProfile
);
router.post("/deleteUser", auth, userController.deleteUser);

// Post Routes
router.post(
  "/createPost",
  upload.single("file"),
  auth,
  userController.createPost
);

router.post("/updatePost",upload.single("file"), auth, userController.updatePost);
router.put("/deletePost", auth, userController.deletePost);
router.get("/getAllPost", auth, userController.getAllPost);
router.get("/getUserPosts", auth, userController.getUserPost);
router.get("/postswithfiles", auth, userController.getAllPostsWithFiles);

module.exports = router;
