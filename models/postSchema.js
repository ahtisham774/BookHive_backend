const mongoose = require("mongoose");
const user = require("./userSchema");
const { Schema } = mongoose;
const postSchema = new Schema({
    bookName: { type: String, default: null },
    bookPrice: { type: String, default: null },
    category: { type: String, default: null },
    Author: { type: String, default: null },
    pdf: {
        type: String,
        default: null
    },
    file: {
        type: String,
        default: null
    },
    description: {
        type: String,
        require: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: user,
        require: true,
    },
    status: { type: String, default: "active" },
    rated: [],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

const post = mongoose.model("post", postSchema);
module.exports = post;
