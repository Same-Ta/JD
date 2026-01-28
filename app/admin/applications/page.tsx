"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "../../../lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { useAuth } from "../../../context/AuthContext"

type Application = {
    id: string
    seekerId: string
    seekerName: string
    seekerEmail: string
    jobId: string
    jobTitle: string
    status: string
    appliedAt: string
    checklistDetails?: Record<string, {
        title: string
        description: string
        checked: boolean
        comment: string
    }>
    comments?: string
}

export default function AdminApplicationsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "interview" | "accepted" | "rejected">("all")

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) {
                router.push("/login")
                return
            }

            try {
                const q = query(collection(db, "applications"), orderBy("appliedAt", "desc"))
                const querySnapshot = await getDocs(q)
                const apps: Application[] = []
                
                querySnapshot.forEach((doc) => {
                    apps.push({ id: doc.id, ...doc.data() } as Application)
                })
                
                setApplications(apps)
            } catch (error) {
                console.error("지원서 조회 실패:", error)
                alert("지원서 조회에 실패했습니다.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchApplications()
    }, [user, router])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "검토 중":
            case "면접 요청":
                return "text-orange-600 bg-orange-50"
            case "면접 예정":
                return "text-blue-600 bg-blue-50"
            case "합격":
                return "text-green-600 bg-green-50"
            case "불합격":
                return "text-gray-600 bg-gray-50"
            default:
                return "text-gray-600 bg-gray-50"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "검토 중":
            case "면접 요청":
                return "⏳"
            case "면접 예정":
                return "📅"
            case "합격":
                return "✓"
            case "불합격":
                return "✗"
            default:
                return "📄"
        }
    }

    const filteredApplications = applications.filter((app) => {
        if (selectedTab === "all") return true
        if (selectedTab === "pending") return app.status === "검토 중" || app.status === "면접 요청"
        if (selectedTab === "interview") return app.status === "면접 예정"
        if (selectedTab === "accepted") return app.status === "합격"
        if (selectedTab === "rejected") return app.status === "불합격"
        return true
    })

    const getTabCount = (tab: string) => {
        if (tab === "all") return applications.length
        if (tab === "pending") return applications.filter(a => a.status === "검토 중" || a.status === "면접 요청").length
        if (tab === "interview") return applications.filter(a => a.status === "면접 예정").length
        if (tab === "accepted") return applications.filter(a => a.status === "합격").length
        if (tab === "rejected") return applications.filter(a => a.status === "불합격").length
        return 0
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600 flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    지원서 로딩 중...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">지원서 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">2025년 하반기 각 주문별 진입 및 경력사원 채용</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setSelectedTab("all")}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                                selectedTab === "all"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            접수 <span className="ml-1">{getTabCount("all")}</span>
                        </button>
                        <button
                            onClick={() => setSelectedTab("pending")}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                                selectedTab === "pending"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            면접 검토 <span className="ml-1">{getTabCount("pending")}</span>
                        </button>
                        <button
                            onClick={() => setSelectedTab("interview")}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                                selectedTab === "interview"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            서류 합격자 <span className="ml-1">{getTabCount("interview")}</span>
                        </button>
                        <button
                            onClick={() => setSelectedTab("accepted")}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                                selectedTab === "accepted"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            입사뷰 <span className="ml-1">{getTabCount("accepted")}</span>
                        </button>
                        <button
                            onClick={() => setSelectedTab("rejected")}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                                selectedTab === "rejected"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            입사 제안 <span className="ml-1">{getTabCount("rejected")}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
                        <div className="col-span-1 text-center">
                            <input type="checkbox" className="rounded border-gray-300" />
                        </div>
                        <div className="col-span-2">이름</div>
                        <div className="col-span-1 text-center">서류</div>
                        <div className="col-span-3">전형 단계</div>
                        <div className="col-span-3 text-center">면접 일시</div>
                        <div className="col-span-2"></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {filteredApplications.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                지원서가 없습니다.
                            </div>
                        ) : (
                            filteredApplications.map((app) => (
                                <div
                                    key={app.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/admin/applications/${app.id}`)}
                                >
                                    <div className="col-span-1 flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className="font-medium text-gray-900">{app.seekerName || "이름 없음"}</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className="text-gray-500">📄</span>
                                    </div>
                                    <div className="col-span-3 flex items-center">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                {getStatusIcon(app.status)} {app.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center justify-center text-sm text-gray-600">
                                        {app.status === "면접 예정" ? "6월 15일 (목) 오후 1시" : "-"}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/admin/applications/${app.id}`)
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            자세히 보기 →
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {filteredApplications.length > 0 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 text-sm">
                            이전
                        </button>
                        <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm">1</button>
                        <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 text-sm">
                            다음
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
