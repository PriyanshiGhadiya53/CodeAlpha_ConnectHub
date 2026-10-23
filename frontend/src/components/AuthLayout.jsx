
import { Users, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function AuthLayout({ children }) {
    const location = useLocation();
    const isLogin = location.pathname === "/login";
    return (
        <div className="min-h-screen bg-[#F7F3FF] p-4 sm:p-6">
            <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-[#EDE0FF] bg-white shadow-xl shadow-purple-100/60 lg:grid-cols-2">

                {/* Left Side */}
                <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4B187E] to-[#61269B] p-10 text-white lg:flex xl:p-14">
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                                <Users size={27} />
                            </div>

                            <h1 className="text-2xl font-extrabold">
                                Connect<span className="text-[#EDE0FF]">Hub</span>
                            </h1>
                        </div>

                        <div className="mt-20">
                            <div className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wider text-[#EDE0FF]">
                                <Sparkles size={18} />
                                YOUR COMMUNITY, YOUR SPACE
                            </div>

                            <h2 className="max-w-md text-4xl font-extrabold leading-tight xl:text-5xl">
                                Your people.
                                <br />
                                Your stories.
                                <br />
                                <span className="text-[#EDE0FF]">Your community.</span>
                            </h2>

                            <p className="mt-6 max-w-sm text-base leading-7 text-purple-100">
                                Share your moments, discover new ideas, and build meaningful
                                connections with people who inspire you.
                            </p>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <Heart size={23} />
                            </div>

                            <div>
                                <p className="font-semibold">Made for connections</p>
                                <p className="mt-1 text-sm text-purple-200">
                                    Share. Connect. Grow together.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 text-sm text-purple-200">
                        <MessageCircle size={17} />
                        A little closer, every day. 💜
                    </div>
                </section>

                {/* Right Side */}
                <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        
                        <div className="mb-8 rounded-xl bg-[#F7F3FF] p-1.5">
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/login"
                                    className={`rounded-lg py-3 text-center font-semibold transition ${isLogin
                                            ? "bg-[#4B187E] text-white shadow-md"
                                            : "text-[#4B187E] hover:bg-[#EDE0FF]"
                                        }`}
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className={`rounded-lg py-3 text-center font-semibold transition ${!isLogin
                                            ? "bg-[#4B187E] text-white shadow-md"
                                            : "text-[#4B187E] hover:bg-[#EDE0FF]"
                                        }`}
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                        

                        <div className="mb-8 flex items-center gap-2 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4B187E] text-white">
                                <Users size={22} />
                            </div>

                            <span className="text-xl font-extrabold text-[#4B187E]">
                                ConnectHub
                            </span>
                        </div>

                        {children}
                    </div>
                </section>

            </div>
        </div>
    );
}

export default AuthLayout;
