const joi = require("joi");
const { updateProfile } = require("../providers/user");

const userValidate = {
  createUser: joi.object({
    email: joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    password: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{7,30}$"))
      .required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    role: joi.string().required(),
  }),
  login: joi.object({
    email: joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    password: joi.string().required(),
  }),
  updateProfile: joi.object({
    userId: joi.string().required(),
  }),
  createPost: joi.object({
    fileName: joi.string().required(),
    mimetype: joi.string().required(),
    description: joi.string().required(),
    status: joi.string().required(),
  }),

  deletePost: joi.object({
    postId: joi.string().required(),
  }),
};

module.exports = userValidate;
