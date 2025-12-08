'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import CompanyDashboard from '../../components/companyDashboard'
import SeekerDashboard from '../../components/SeekerDashboard'
import { LogOut } from 'lucide-react'

export default function MyPage() {
    const { user, userData, logout } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            setIsLoading(false);
        }
    }, [user, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center gradient-bg">
            <div className="glass-card p-6 rounded-2xl">
                <div className="text-gray-600 flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    로딩 중...
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen gradient-bg">
            {/* Header */}
            <div className="glass-card border-b border-white/20 shadow-lg">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gradient">마이페이지</h1>
                        <p className="text-sm text-gray-500 mt-1">{userData?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/80 transition-all font-medium border border-white/30"
                    >
                        <LogOut size={18} />
                        로그아웃
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                {userData?.role === 'company' ? (
                    <CompanyDashboard />
                ) : userData?.role === 'seeker' ? (
                    <SeekerDashboard />
                ) : (
                    <div className="glass-card rounded-2xl p-6 text-gray-500">역할을 확인할 수 없습니다.</div>
                )}
            </div>
        </div>
    );
}
