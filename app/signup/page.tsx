'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SignupPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'seeker' | 'company'>('seeker');
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            alert(role === 'seeker' ? '이름을 입력해주세요.' : '기업명을 입력해주세요.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                role: role,
                name: name,
                createdAt: new Date().toISOString(),
            });

            alert('가입 완료');
            router.push('/login');
        } catch (error) {
            console.error('Error signing up:', error);
            alert('가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen gradient-bg">
            <div className="w-full max-w-md px-6">
                <div className="glass-card glow rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg glow-sm">
                            <div className="w-6 h-6 bg-white/30 rounded rotate-45"></div>
                        </div>
                        <h1 className="text-2xl font-bold text-gradient">회원가입</h1>
                        <p className="text-sm text-gray-500 mt-2">새 계정을 만들어보세요</p>
                    </div>
                    
                    {/* Role Selection Tabs */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('seeker')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                                role === 'seeker'
                                    ? 'btn-gradient text-white shadow-lg'
                                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                            }`}
                        >
                            개인 회원
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('company')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                                role === 'company'
                                    ? 'btn-gradient text-white shadow-lg'
                                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                            }`}
                        >
                            기업 회원
                        </button>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {role === 'seeker' ? '이름' : '기업명'}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={role === 'seeker' ? '실명 입력' : '회사명 입력'}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6자 이상"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-3 btn-gradient text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all mt-2"
                        >
                            가입하기
                        </button>
                    </form>
                    
                    <p className="mt-6 text-center text-gray-500 text-sm">
                        이미 계정이 있으신가요?{' '}
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;