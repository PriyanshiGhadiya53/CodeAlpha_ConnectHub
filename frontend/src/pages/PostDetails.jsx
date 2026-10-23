import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Trash2, Pencil, X } from "lucide-react";

const API_URL = "https://connecthub-backend-zf8y.onrender.com/api/v1";

function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const getPost = async () => {
    const response = await fetch(`${API_URL}/post/${postId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load post.");
    }

    setPost(data.data);
  };

  const getComments = async () => {
    const response = await fetch(`${API_URL}/comment/${postId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load comments.");
    }

    setComments(Array.isArray(data.data) ? data.data : []);
  };

  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/user/me`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUserId(data.data?._id || data.data?.id || "");
      }

    } catch (err) {
      console.error("Unable to get current user:", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([getPost(), getComments(), getCurrentUser()]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/comment/${postId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment.");
      }

      setContent("");
      await getComments();
    } catch (err) {
      setError(err.message || "Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/comment/edit/${commentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update comment.");
      }

      setEditingId(null);
      setEditContent("");
      await getComments();
    } catch (err) {
      setError(err.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm("Delete this comment?");

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/comment/edit/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete comment.");
      }

      await getComments();
    } catch (err) {
      setError(err.message || "Failed to delete comment.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3ECFF] text-[#4B187E]">
        Loading post and comments...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F3ECFF] p-8">
        <button onClick={() => navigate("/")} className="mb-4 flex items-center gap-2 text-[#4B187E]">
          <ArrowLeft size={20} /> Back to Home
        </button>
        <p className="text-red-600">{error || "Post not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3ECFF] px-4 py-8 text-gray-800">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 font-medium text-[#4B187E]"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="rounded-[28px] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE0FF] font-bold text-[#4B187E]">
                {(post.author?.fullName || post.author?.userName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <p className="font-bold text-[#4B187E]">
                {post.author?.fullName || post.author?.userName || "User"}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {post.content && (
            <p className="whitespace-pre-wrap leading-7">{post.content}</p>
          )}

          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="mt-4 max-h-[600px] w-full rounded-2xl object-contain"
            />
          )}
        </div>

        <div className="mt-6 rounded-[28px] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-[#4B187E]">
            <MessageCircle size={22} />
            Comments ({comments.length})
          </h2>

          <form onSubmit={handleAddComment} className="flex gap-3">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-xl border border-purple-100 bg-[#F7F3FF] px-4 py-3 outline-none focus:border-[#61269B]"
            />

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#4B187E] px-4 py-3 font-medium text-white hover:bg-[#61269B] disabled:opacity-50"
            >
              <Send size={18} />
              <span className="hidden sm:inline">
                {submitting ? "Sending..." : "Send"}
              </span>
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 space-y-5">
            {comments.length === 0 && (
              <p className="py-6 text-center text-gray-500">
                No comments yet. Be the first to comment!
              </p>
            )}

            {comments.map((comment) => {
              const authorId = comment.author?._id || comment.author?.id;
              const isOwner =
                currentUserId &&
                authorId &&
                currentUserId.toString() === authorId.toString();

              return (
                <div key={comment._id} className="flex gap-3">
                  {comment.author?.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE0FF] font-bold text-[#4B187E]">
                      {(comment.author?.fullName || comment.author?.userName || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 rounded-2xl bg-[#F7F3FF] p-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold text-[#4B187E]">
                          {comment.author?.fullName ||
                            comment.author?.userName ||
                            "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>

                      {isOwner && editingId !== comment._id && (
                        <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditContent(comment.content);
                            }}
                            aria-label="Edit comment"
                            className="rounded-lg p-2 text-[#61269B] hover:bg-purple-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id)}
                            aria-label="Delete comment"
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>


                    {editingId === comment._id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="w-full rounded-xl border border-purple-200 bg-white p-3 outline-none focus:border-[#61269B]"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditComment(comment._id)}
                            className="rounded-lg bg-[#4B187E] px-3 py-2 text-sm font-medium text-white"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                            className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm"
                          >
                            <X size={15} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetails;