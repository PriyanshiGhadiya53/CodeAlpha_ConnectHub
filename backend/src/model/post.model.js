import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ""
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ]
},
    {
        timestamps: true
    })

export const Post = mongoose.model("Post", postSchema);