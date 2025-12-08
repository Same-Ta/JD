'use client'

import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'

interface Application {
    id: string
    jobTitle: string
    teamName: string
    appliedAt: string
    status: string
}

const SeekerDashboard: React.FC = () => {
    const { user } = useAuth()
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false)
            return
        }

        const q = query(
            collection(db, 'applications'),
            where('seekerId', '==', user.uid)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                id: doc.id,
                ...doc.data(),
            })) as Application[]
            apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
            setApplications(apps)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching applications:', error)
            setLoading(false)
        })

        return () => {
            unsubscribe()
        }
    }, [user?.uid])

    if (loading) {
        return (
            <div className="p-6 text-gray-500 glass-card rounded-2xl flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                로딩 중...
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case '합격':
                return 'bg-gradient-to-r from-emerald-400 to-green-500 text-white'
            case '불합격':
                return 'bg-gradient-to-r from-rose-400 to-red-500 text-white'
            default:
                return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case '합격':
                return '합격'
            case '불합격':
                return '불합격'
            default:
                return '검토 중'
        }
    }

    const cardColors = ["bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-cyan-500", "bg-sky-500", "bg-blue-600"]

    return (
        <div className="py-6">
            <h2 className="text-xl font-bold mb-6 text-gradient">내 지원 내역</h2>
            
            {applications.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl">
                    <p className="text-gray-500 mb-4">지원 내역이 없습니다.</p>
                    <Link 
                        href="/jobs"
                        className="inline-block px-6 py-2.5 btn-gradient text-white rounded-xl hover:opacity-90 text-sm font-medium transition-all"
                    >
                        공고 보러가기
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {applications.map((app, index) => (
                        <div key={app.id} className="glass-card hover-glow rounded-2xl p-5">
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-1.5 h-12 rounded-full ${cardColors[index % cardColors.length]}`}></div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-800">{app.jobTitle}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{app.teamName}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(app.status)}`}>
                                    {getStatusLabel(app.status)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 pl-4">
                                지원일: {new Date(app.appliedAt).toLocaleDateString('ko-KR')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SeekerDashboard
