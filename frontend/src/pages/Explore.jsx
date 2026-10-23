
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, LoaderCircle, Compass, Share2 } from "lucide-react";

const API_URL = "http://localhost:8000/api/v1";

function Explore() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getExplorePosts = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API_URL}/post/explore`, {
                    credentials: "include",
                });

                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.message || "Posts load nahi hui.");
                }

                setPosts(result.data || []);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        getExplorePosts();
    }, []);

    const handleLike = async (postId) => {
        try {
            const res = await fetch(`${API_URL}/post/${postId}/like`, {
                method: "POST",
                credentials: "include",
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Like nahi hua.");
            }

            if (result.data) {
                setPosts((prev) =>
                    prev.map((post) =>
                        post._id === postId
                            ? { ...post, ...result.data }
                            : post
                    )
                );
            }
        } catch (err) {
            alert(err.message || "Like karne mein problem aayi.");
        }
    };

    const handleShare = async (postId) => {
        const link = `${window.location.origin}/post/${postId}`;

        try {
            await navigator.clipboard.writeText(link);
            alert("Post link copied!");
        } catch {
            alert("Link: " + link);
        }
    };

    const filteredPosts = posts.filter((post) => {
        const text = `${post.content || ""} ${post.author?.fullName || ""
            } ${post.author?.userName || ""}`;

        return text.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-[#F7F3FF] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="rounded-xl bg-[#EDE0FF] p-2.5 text-[#4B187E]">
                                <Compass size={24} />
                            </div>

                            <h1 className="text-2xl font-bold text-[#4B187E] sm:text-3xl">
                                Explore
                            </h1>
                        </div>

                        <p className="mt-2 text-sm text-gray-500 sm:text-base">
                            Discover posts, ideas and creators on ConnectHub.
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-sm">
                        <Search
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search posts or creators..."
                            className="w-full rounded-2xl border border-purple-100 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#61269B] focus:ring-2 focus:ring-purple-100"
                        />
                    </div>
                </div>

                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-800">
                            Discover something new
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            {filteredPosts.length} posts to explore
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="flex min-h-64 items-center justify-center">
                        <LoaderCircle
                            size={34}
                            className="animate-spin text-[#61269B]"
                        />
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
                        <p className="text-red-600">{error}</p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl bg-[#4B187E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#61269B]"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && filteredPosts.length === 0 && (
                    <div className="rounded-2xl border border-purple-100 bg-white px-5 py-16 text-center">
                        <Compass
                            size={38}
                            className="mx-auto mb-3 text-[#61269B]"
                        />

                        <h3 className="text-lg font-semibold text-[#4B187E]">
                            No posts found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            Try another search or explore again later.
                        </p>
                    </div>
                )}

                {!loading && !error && filteredPosts.length > 0 && (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4">            {filteredPosts.map((post) => (
                        <article
                            key={post._id}
                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-purple-100 transition hover:shadow-lg sm:rounded-2xl"
                            onClick={() => navigate(`/post/${post._id}`)}
                        >
                            {post.image ? (
                                <img
                                    src={post.image}
                                    alt={post.content || "Explore post"}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#EDE0FF] via-white to-purple-200 p-2 sm:p-5">
                                    <p className="line-clamp-5 break-words text-center text-xs font-medium text-[#4B187E] sm:line-clamp-6 sm:text-base">
                                        {post.content || "ConnectHub post"}
                                    </p>
                                </div>
                            )}

                            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-[#24083D]/85 via-transparent to-black/20 p-2 opacity-100 transition sm:p-4 sm:opacity-0 sm:group-hover:opacity-100">
                                <div className="flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShare(post._id);
                                        }}
                                        aria-label="Share post"
                                        className="rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50 sm:p-2"
                                    >
                                        <Share2 size={15} />
                                    </button>
                                </div>

                                <div className="text-white">
                                    <p className="line-clamp-3 text-xs font-medium sm:text-sm">
                                        {post.content || "Discover this post"}
                                    </p>

                                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:mt-2 sm:gap-2 sm:text-sm">
                                        <Heart size={14} />
                                        <span>{post.likes?.length || 0}</span>
                                        <span className="ml-1 truncate opacity-90">
                                            @{post.author?.userName || "user"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLike(post._id);
                                }}
                                aria-label="Like post"
                                className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 text-[#61269B] shadow-sm transition hover:scale-110 sm:hidden"
                            >
                                <Heart size={14} />
                            </button>
                        </article>
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Explore;
