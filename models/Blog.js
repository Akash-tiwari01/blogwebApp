const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title:String,
    content:String,
    Author:String,
    postedAt: {type:Date,default: Date.now},
    postedBy: mongoose.Schema.Types.ObjectId,
});

const Blog = mongoose.model('Blog',blogSchema);

module.exports = Blog;