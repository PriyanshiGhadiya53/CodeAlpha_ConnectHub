import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, ArrowLeft, X, LoaderCircle } from "lucide-react";

const API_URL = "http://localhost:8000/api/v1";

function CreatePost() {
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim() && !image) {
      setError("Please write something or select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/post`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post.");
      }

      navigate("/", { state: { refreshPosts: true } });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3ECFF] px-4 py-8 text-gray-800">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 font-medium text-[#4B187E] hover:text-[#61269B]"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-[#4B187E]">
            Create Post
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Share your thoughts and moments with your community.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="postContent"
                className="mb-2 block font-semibold text-gray-700"
              >
                What's on your mind?
              </label>

              <textarea
                id="postContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something to share..."
                rows={5}
                className="w-full resize-y rounded-2xl border border-purple-100 bg-[#F7F3FF] p-4 outline-none transition focus:border-[#61269B] focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label
                htmlFor="postImage"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 p-5 font-medium text-[#61269B] transition hover:bg-[#F7F3FF]"
              >
                <ImagePlus size={22} />
                Choose an Image
              </label>

              <input
                id="postImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {preview && (
              <div className="relative">
                <img
                  src={preview}
                  alt="Post preview"
                  className="max-h-[420px] w-full rounded-2xl object-contain"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove image"
                  className="absolute right-3 top-3 rounded-full bg-white p-2 text-gray-700 shadow hover:bg-red-50 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4B187E] px-5 py-3 font-semibold text-white transition hover:bg-[#61269B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <LoaderCircle size={19} className="animate-spin" />}
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;