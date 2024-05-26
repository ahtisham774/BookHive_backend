const bcrypt = require("bcrypt");
const userModel = require("../models/userSchema");
const userValidator = require("../validators/userValidate");
const postModel = require("../models/postSchema");
const fs = require("fs");
const path = require("path");
const JWT = require("jsonwebtoken");
const user = require("../models/userSchema");
const userService = {
    getFile: async (req, res) => {
        const { filePath } = req.params;

        // Construct the full file path
        const fullPath = path.join(__dirname, "uploads", filePath); // Assuming files are stored in an "uploads" directory

        try {
            // Check if the file exists
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({
                    statusCode: 404,
                    status: "failure",
                    message: "File not found.",
                });
            }

            // Send the file
            res.sendFile(fullPath, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        statusCode: 500,
                        status: "failure",
                        message: "Internal server error.",
                    });
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                statusCode: 500,
                status: "failure",
                message: "Internal server error.",
            });
        }
    },

    createUser: async (req, res) => {
        console.log(req.body);
        const { email, password, firstName, lastName, contact, status, role } =
            req.body;
        const validation = userValidator.createUser.validate({
            email,
            password,
            firstName,
            lastName,
            role,
        });
        if (validation.error) {
            return res.status(406).json({
                statusCode: 406,
                status: "failure",
                message: validation.error.message,
            });
        }
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            let create = await userModel.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                contact,
            });
            if (create) {
                let userId = create._id;
                // 1d for 1 day
                const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
                    expiresIn: "3h",
                });
                return res.status(201).json({
                    statusCode: 201,
                    status: "success",
                    message: "Successfully created",
                    token: token,
                });
            } else {
                return res.status(501).json({
                    statusCode: 501,
                    status: "failure",
                    message: "Something went wrong",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(501).json({
                statusCode: 501,
                status: "failure",
                message: "user with email already exists",
            });
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        const validation = userValidator.login.validate({
            email,
            password,
        });
        if (validation.error) {
            return res.status(406).json({
                statusCode: 406,
                status: "Invalid Credentials",
                message: validation.error.message,
            });
        }
        try {
            let user = await userModel.findOne({ email });
            console.log("user==>", user);
            const hashedPassword = await bcrypt.compare(password, user.password);

            if (hashedPassword) {
                let userId = user._id;
                // 1d for 1 day
                const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
                    expiresIn: "68h",
                });
                return res.status(201).json({
                    statusCode: 201,
                    status: "success",
                    userdetails: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar

                    },
                    token: token,
                });
            } else {
                return res.status(501).json({
                    statusCode: 501,
                    status: "failure",
                    message: "Invalid Credentials",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(501).json({
                statusCode: 501,
                status: "failure",
                message: e,
            });
        }
    },
    updateProfile: async (req, res) => {
        const userId = req.user;
        const { contact, firstName, lastName, password } = req.body;
        console.log(req.body, req.file)
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
            const saltRounds = 10;
            let avatar = req.file ? req.file.path : null;
            let hashedPassword;

            if (password) {
                hashedPassword = await bcrypt.hash(password, saltRounds);
            }

            const updateFields = {};

            if (contact) updateFields.contact = contact;
            if (avatar) updateFields.avatar = avatar;
            if (password) updateFields.password = hashedPassword;
            if (firstName) updateFields.firstName = firstName;
            if (lastName) updateFields.lastName = lastName;

            const updateUser = await userModel.findOneAndUpdate(
                { _id: userId },
                { $set: updateFields },
                { new: true } // This option returns the updated document
            );
            if (updateUser) {

                const user = await userModel.findById(userId).select(
                    "firstName lastName email contact role status avatar"

                )
                return res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "profile updated successfully",
                    data: user,

                });
            } else {
                return res.status(406).json({
                    statusCode: 406,
                    status: "failure",
                    message: "some error occurred",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                statusCode: 500,
                status: "failure",
                message: e,
            });
        }
    },
    getCurrentUser: async (req, res) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if (!token) return res.status.send({ error: "Invalid token" });
            try {
                const data = JWT.verify(token, process.env.JWT_SECRET);
                if (data) {
                    const user = await userModel.findById(data.userId).select('firstName lastName email contact role status avatar')
                    return res.status(200).send(user)

                }
                else {
                    return res.status(401).send({ error: "Invalid token" })
                }
            } catch (error) {
                console.log(error);
                return res.status(401).send({
                    error: "Invalid token",
                });
            }


        } catch (error) {
            return res.send({
                status: "failure",
                statusCode: 500,
                error: "Internal Server Error",
            });
        }
    },
    getUserProfile: async (req, res) => {
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
            if (userDetails) {
                return res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    data: userDetails,
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
    deleteUser: async (req, res) => {
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
            const userDetails = await userModel.findOneAndDelete({
                _id: userId,
            });
            if (userDetails) {
                return res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "user deleted",
                });
            } else {
                return res.status(401).json({
                    statusCode: 401,
                    status: "failure",
                    message: "can't delete user",
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
    getUserPost: async (req, res) => {
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
            const search = req.query.search;
            const userDetails = await postModel.find({
                userId: userId,
                bookName: new RegExp(search, "i"),
            });
            if (userDetails) {
                return res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    data: userDetails,
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

    createPost: async (req, res) => {
        const userId = req.user;
        const {
            description,
            status,
            bookName,
            bookPrice,
            Author,
            pdf,
            category,
        } = req.body;
        console.log(req.body);
        console.log(req.file)
        try {
            const userDetails = await userModel.findOne({ _id: userId });
            if (userDetails.status !== "approved") {
                return res.status(403).json({
                    statusCode: 403,
                    status: "failure",
                    message: "You are not allowed to post yet, please contact the admin.",
                });
            }

            const file = req.file.path // Store file path or other information as needed

            const postCreated = await postModel.create({
                bookName,
                bookPrice,
                category,
                pdf,
                Author,
                file, // Save information about uploaded files in the database
                description,
                status,
                userId: req.user,
            });

            // console.log("postCreated===>", postCreated);
            if (postCreated) {
                return res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Post created successfully",
                    data: postCreated,
                });
            } else {
                return res.status(401).json({
                    statusCode: 401,
                    status: "failure",
                    message: "Something went wrong while creating the post.",
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                statusCode: 500,
                status: "failure",
                message: "Internal server error.",
            });
        }
    },

    updatePost: async (req, res) => {
        const userId = req.user;
        const {
            bookName,
            bookPrice,
            category,
            pdf,
            Author,
            description,
            postId } = req.body;
        const validation = userValidator.deletePost.validate({
            postId,
        });
        if (validation.error) {
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: "invalid user",
            });
        }
        try {

            const updatedPost = await postModel.findById(postId)
            if (bookName) {
                updatedPost.bookName = bookName
            }
            if (bookPrice) {
                updatedPost.bookPrice = bookPrice
            }
            if (category) {
                updatedPost.category = category
            }
            if (pdf) {
                updatedPost.pdf = pdf
            }
            if (Author) {
                updatedPost.Author = Author
            }
            if (description) {
                updatedPost.description = description
            }
            if (req.file) {
                updatedPost.file = req.file.path
            }

            const postCreated = await updatedPost.save();

            return res.status(200).json({
                statusCode: 200,
                status: "success",
                message: "Post successfully updated",
                data: postCreated,
            });



        } catch (e) {
            console.log(e);
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: e,
            });
        }
    },
    deletePost: async (req, res) => {
        const userId = req.user;
        const { postId } = req.body;
        const validation = userValidator.deletePost.validate({
            postId,
        });
        if (validation.error) {
            return res.status(401).json({
                statusCode: 401,
                status: "failure",
                message: "invalid user",
            });
        }
        try {
            const postCreated = await postModel.deleteOne({
                _id: postId,
            });

            if (postCreated) {
                return res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Post Deleted",
                    id: postId
                });
            } else {
                res.status(401).json({
                    statusCode: 401,
                    status: "failure",
                    message: "something went wrong",
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
    getAllPost: async (req, res) => {
        const userId = req.user;
        const search = req.query.search;
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
            const allPosts = await postModel.aggregate([
                search
                    ? {
                        $match: {
                            status: { $ne: "closed" },
                            bookName: new RegExp(search, "i"),
                        },
                    }
                    : {
                        $match: {
                            status: { $ne: "closed" },
                        },
                    },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
                {
                    $lookup: {
                        from: "users", // the name of the user collection
                        localField: "userId", // the field in the post collection
                        foreignField: "_id", // the field in the user collection
                        as: "user", // the name of the array field to add the user data
                    },
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true, // to include posts even if no matching user is found
                    },
                },
                // Optionally, project the fields you need
                {
                    $project: {
                        _id: 1,
                        bookName: 1,
                        bookPrice: 1,
                        Author: 1,
                        pdf: 1,
                        description: 1,
                        file: 1,
                        category: 1,
                        status:1,
                        createdAt: 1,
                        user: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            contact: 1,
                            firstName: 1,
                            lastName: 1,
                            avatar: 1,
                            // Include other user fields as needed
                        },
                    },
                },
            ]);

            // console.log(usertofind);
            if (allPosts.length > 0) {
                return res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    data: allPosts,
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
    getAllPostsWithFiles: async (req, res) => {
        try {
            const userId = req.user;
            const search = req.query.search;
            const posts = await postModel.aggregate([
                search
                    ? {
                        $match: {
                            status: { $ne: "closed" },
                            bookName: new RegExp(search, "i"),
                        },
                    }
                    : {
                        $match: {
                            status: { $ne: "closed" },
                        },
                    },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
                {
                    $lookup: {
                        from: "users", // the name of the user collection
                        localField: "userId", // the field in the post collection
                        foreignField: "_id", // the field in the user collection
                        as: "user", // the name of the array field to add the user data
                    },
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true, // to include posts even if no matching user is found
                    },
                },
                // Optionally, project the fields you need
                {
                    $project: {
                        _id: 1,
                        bookName: 1,
                        bookPrice: 1,
                        description: 1,
                        files: 1,
                        createdAt: 1,
                        user: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            contact: 1,
                            // Include other user fields as needed
                        },
                    },
                },
            ]); // Assuming userId is a reference to the user model

            // Iterate through posts to get file paths
            const postsWithFiles = await Promise.all(
                posts.map(async (post) => {
                    const files = post.files.map((file) => {
                        // Assuming file.filePath stores the path where files are stored
                        const filePath = path.join(__dirname, "..", file.filePath);
                        const fileData = fs.readFileSync(filePath, "utf8"); // Read file synchronously
                        return {
                            fileName: file.fileName,
                            fileData: fileData, // Sending file data to frontend
                        };
                    });
                    return {
                        _id: post._id,
                        sharedWith: post.sharedWith,
                        description: post.description,
                        status: post.status,
                        userId: post.userId,
                        bookName: post.bookName,
                        bookPrice: post.bookPrice,
                        Author: post.Author,
                        category: post.category,
                        files: files,
                    };
                })
            );

            res.status(200).json({
                statusCode: 200,
                status: "success",
                data: postsWithFiles,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                statusCode: 500,
                status: "failure",
                message: "Internal server error.",
            });
        }
    },
};

module.exports = userService;
