import { Post } from "../model/post.model.js";
import { apiError } from "../util/apiError.js";
import { apiResponse } from "../util/apiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { User } from "../model/user.model.js";
import cloudinary from "../config/cloudinary.js";
import { Comment } from "../model/comment.model.js";

const createPost = asyncHandler(async (req, res) => {
     
    const { content } = req.body || {};

    if (!content?.trim() && !req.file) {
        throw new apiError(400, "Post content or image is required");
    }

    let imageUrl = "";

    if (req.file) {
        const fileUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        console.log("Uploaded file:", req.file);
        const result = await cloudinary.uploader.upload(fileUri, {
            folder: "ConnectHub/posts",
            resource_type: "image"
        });

        imageUrl = result.secure_url;
    }

    const post = await Post.create({
        content,
        image: imageUrl,
        author: req.user.id
    });

    return res.status(200).json(
        new apiResponse(200, "Post created successfully", post)
    );
});

//get all posts
const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate("author", "fullName userName avatar")
        .sort({ createdAt: -1 });

    const postsWithCommentCount = await Promise.all(
        posts.map(async (post) => {
            const commentCount = await Comment.countDocuments({
                post: post.id
            });

            return {
                ...post.toObject(),
                commentsCount: commentCount
            };
        })
    );

    return res.status(200).json(
        new apiResponse(
            200,
            "Posts fetched successfully",
            postsWithCommentCount
        )
    );
});


//get single post
const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId)
        .populate("author", "fullName userName avatar");
    if (!post) {
        throw new apiError(400, "post not found.")
    }

    return res.status(200).json(
        new apiResponse(200, "Post fetched successfully", post)
    );

})

//delete post
const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
        throw new apiError(400, "post not found.");
    }

    if (post.author.toString() !== req.user.id) {
        throw new apiError(403, "You are not allowed to delete this post");
    }

    await post.deleteOne();
    return res.status(200).json(
        new apiResponse(200, "Post deleted successfully", {})
    );
})

// update post
const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body || {};

    const post = await Post.findById(postId);

    if (!post) {
        throw new apiError(404, "Post not found");
    }

    if (post.author.toString() !== req.user.id) {
        throw new apiError(403, "You are not allowed to update this post");
    }

    if (content !== undefined) {
        post.content = content;
    }

    if (req.file) {
        const fileUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(fileUri, {
            folder: "ConnectHub/posts",
            resource_type: "image"
        });

        post.image = result.secure_url;
    }

    await post.save();

    return res.status(200).json(
        new apiResponse(200, "Post updated successfully", post)
    );
});

const toggleLikePost = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
        throw new apiError(404, "Post not found.");
    }

    const alreadyLiked = post.likes.some(
        (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
        post.likes = post.likes.filter(
            (id) => id.toString() !== userId.toString()
        );
    } else {
        post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json(
        new apiResponse(
            200,
            alreadyLiked ? "Post unliked" : "Post liked",
            post
        )
    );
});
// Get posts liked by logged-in user
const getLikedPosts = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const posts = await Post.find({
        likes: userId
    })
        .populate("author", "fullName userName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new apiResponse(
            200,
            "Liked posts fetched successfully",
            posts
        )
    );
});


//Following Feed
const getFollowingFeed = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    const followingIds = user.following;
    const posts = await Post.find({ author: { $in: followingIds } })
        .populate("author", "fullName userName avatar")
        .sort({ createdAt: -1 })
    return res.status(200).json(
        new apiResponse(200, "Following feed fetched successfully", posts)
    );


})


const explorePosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate("author", "fullName userName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new apiResponse(200, "Explore posts fetched successfully", posts)
    );
});

export { createPost, getAllPosts, getPostById, deletePost, updatePost, toggleLikePost,
    getFollowingFeed,explorePosts, getLikedPosts
 };