const bcrypt = require("bcrypt");
const userModel = require("../models/userSchema");
const userValidator = require("../validators/userValidate");
const postModel = require("../models/postSchema");

let adminService = {

    getAllUsers: async (req, res) => {
        const userId = req.user;
        const validation = userValidator.updateProfile.validate({
            userId,
        });
        if (validation.error) {
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: "invalid user",
            });
        }
        try {
            const userDetails = await userModel.findOne({
                _id: userId,
            });
            console.log(userDetails, userDetails.role === "admin");
            if (userDetails.role === "admin") {
                const users = await userModel.find().where(
                    "role",
                    "user"
                ).select(
                    "-password -forgottenPasswordToken -tokenExpiredTime  -__v"
                );
                return res.status(200).send(users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
            } else {
                return res.status(401).send({
                    statusCode: 401,
                    status: "failure",
                    message: "invalid user",
                })
            }


        } catch (err) {
            res.status(500).json({ message: err.message });
        }

    }
    ,

    deleteUser: async (req, res) => {
        const userId = req.user;
        console.log(userId);
        const { enduser } = req.body; console.log(req.body)
        const validation = userValidator.updateProfile.validate({
            userId,
        });
        if (validation.error) {
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: "invalid user",
            });
        }
        try {
            const userDetails = await userModel.findOne({
                _id: userId,
            });
            console.log(userDetails, userDetails.role === "admin");
            if (userDetails.role === "admin") {
                let updateUser = await userModel.findByIdAndDelete(enduser)
                return res.status(200).json({ id: updateUser._id });
            } else {
                return res.send({
                    status: "failure",
                    statusCode: 401,
                    message: "you are not authorized",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: e,
            });
        }


    }
    ,

    verifyPost: async (req, res) => {
        const userId = req.user;
        const { postId } = req.body;
        console.log(req.body)
        const validation = userValidator.updateProfile.validate({
            userId,
        });
        if (validation.error) {
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: "invalid user",
            });
        }
        try {
            const userDetails = await userModel.findOne({
                _id: userId,
            });
            console.log(userDetails, userDetails.role === "admin");
            if (userDetails.role === "admin") {
                let updatePost = await postModel.findById(postId).select("-__v");
                updatePost.status = updatePost.status === "unverified" ? "verified" : "unverified"
                await updatePost.save();
                console.log(updatePost);

                return res.status(200).json({
                    status: "success",
                    statusCode: 200,
                    message: "post verified",
                    data: updatePost
                });
            } else {
                return res.send({
                    status: "failure",
                    statusCode: 401,
                    message: "you are not authorized",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: e,
            });
        }
    },

    //   getAllPendingUsers: async (req, res) => {
    //     console.log(req.user);
    //     const userId = req.user;
    //     const search = req.query.search;
    //     const validation = userValidator.updateProfile.validate({
    //       userId,
    //     });
    //     if (validation.error) {
    //       return res.status(401).json({
    //         statusCode: 401,
    //         status: "failure",
    //         message: "invalid user",
    //       });
    //     }
    //     try {
    //       const userDetails = await userModel.findOne({
    //         _id: userId,
    //       });
    //       console.log(userDetails, userDetails.role === "admin");
    //       if (userDetails.role === "admin") {
    //         let activeUsers = await userModel.aggregate([
    //           {
    //             $match: {
    //               status: "approved",
    //               role: "user",
    //             },
    //           },
    //           {
    //             $group: {
    //               _id: null,
    //               count: { $sum: 1 },
    //             },
    //           },
    //         ]);
    //         console.log("activeUsers===>", activeUsers);

    //         let allUsers = await userModel.aggregate([
    //           {
    //             $match: {
    //               status: "inprogress",
    //               role: "user",
    //             },
    //           },
    //           search
    //             ? {
    //                 $match: {
    //                   firstName: new RegExp(search, "i"),
    //                 },
    //               }
    //             : {
    //                 $match: {},
    //               },
    //         ]);
    //         console.log("pending users===>", allUsers);
    //         return res.status(200).json({
    //           statusCode: 200,
    //           status: "success",
    //           pendingUsers: allUsers,
    //           countOfActiveUsers: activeUsers.length > 0 ? activeUsers[0].count : 0,
    //         });
    //       }
    //     } catch (e) {
    //       console.log(e);
    //       return res.status(401).json({
    //         statusCode: 401,
    //         status: "failure",
    //         message: e,
    //       });
    //     }
    //   },
    updateUserStatus: async (req, res) => {
        const userId = req.user;
        console.log(userId);
        const { enduser, changeStatus } = req.body;
        console.log(req.body)
        const validation = userValidator.updateProfile.validate({
            userId,
        });
        if (validation.error) {
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: "invalid user",
            });
        }
        try {
            const userDetails = await userModel.findOne({
                _id: userId,
            });
            console.log(userDetails, userDetails.role === "admin");
            if (userDetails.role === "admin") {
                let updateUser = await userModel.findById(enduser).select("-password -forgottenPasswordToken -tokenExpiredTime  -__v");
                updateUser.status = changeStatus
                await updateUser.save();
                console.log(updateUser);

                return res.status(200).json(updateUser);
            } else {
                return res.send({
                    status: "failure",
                    statusCode: 401,
                    message: "you are not authorized",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: e,
            });
        }
    },
};
module.exports = adminService;
