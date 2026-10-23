import { Comment } from "../model/comment.model.js";
import { Post } from "../model/post.model.js";
import { apiError } from "../util/apiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { apiResponse } from "../util/apiResponse.js";

//createComment
const createComment =asyncHandler(async(req,res)=>{

    const {postId}=req.params;
    const {content}=req.body;

    if (!content || !content.trim()) {
        throw new apiError(400, "Comment content is required");
    }

    const post=await Post.findById(postId);
     if (!post) {
        throw new apiError(404, "Post not found");
    }

    const comment=await Comment.create({
        content,
        author:req.user.id,
        post:postId
    });
     return res.status(201).json(
        new apiResponse(201, "Comment added successfully", comment)
    );
})

//getPostComments
const getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
        throw new apiError(404, "Post not found");
    }

    const comments = await Comment.find({ post: postId })
        .populate("author", "fullName userName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new apiResponse(200, "Comments fetched successfully", comments)
    );
});

//updateComment
const updateComment =asyncHandler(async(req,res)=>{
    const { commentId  } = req.params;
    const {content}=req.body;
     if (!content || !content.trim()) {
        throw new apiError(400, "Comment content is required");
    }
    const comment = await Comment.findById(commentId );

     if (!comment) {
        throw new apiError(404, "Comment not found");
    }
      if (comment.author.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You cannot update this comment");
    }
    comment.content = content;
    await comment.save();

    return res.status(200).json(
        new apiResponse(200, "Comment updated successfully", comment)
    );

})

//deleteComment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (comment.author.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You cannot delete this comment");
    }

    await comment.deleteOne();

    return res.status(200).json(
        new apiResponse(200, "Comment deleted successfully", {})
    );
});


export {createComment,getPostComments,updateComment,deleteComment}