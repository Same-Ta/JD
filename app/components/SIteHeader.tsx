"use client"

import { useAuth } from "../../context/AuthContext"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"

export default function SiteHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
            <div className="w-full h-full px-6 flex items-center justify-between">
                {/* Logo */}
                <button
                    onClick={() => router.push("/jobs")}
                    className="text-xl font-bold hover:opacity-80 transition flex items-center gap-2"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg glow-sm">
                        <span className="text-white font-bold text-sm">W</span>
                    </div>
                    <span className="text-gradient font-bold">WINNOW</span>
                </button>

                {/* Right Section - 우측 끝 정렬 */}
                <div className="flex items-center gap-2 ml-auto">
                    {user ? (
                        <>
                            <Button
                                onClick={() => router.push("/mypage")}
                                className="flex items-center gap-2 btn-gradient text-white"
                            >
                                <User className="w-4 h-4" />
                                마이페이지
                            </Button>
                            <Button
                                onClick={logout}
                                size="sm"
                                className="bg-white hover:bg-gray-50 border border-gray-200"
                            >
                                <LogOut className="w-4 h-4 text-gray-600" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => router.push("/login")}
                            className="btn-gradient text-white"
                        >
                            로그인
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}