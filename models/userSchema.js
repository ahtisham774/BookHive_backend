const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact: { type: Number },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    
  },
  status: { type: String, default: "inprogress" },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  forgottenPasswordToken: {
    type: String,
    default: null,
  },
  tokenExpiredTime: {
    type: Date,
    default: null,
  },
  createdAt: { type: Date, default: Date.now() },
});

const user = mongoose.model("user", userSchema);
// user.createIndexes();
module.exports = user;
