"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { db } from "../../../../lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useAuth } from "../../../../context/AuthContext"
import { ArrowLeft } from "lucide-react"

type Application = {
    id: string
    seekerId: string
    seekerName: string
    seekerEmail: string
    jobId: string
    jobTitle: string
    jobCreatorId: string
    status: string
    appliedAt: string
    aiSummary?: string
    checklistDetails?: Record<string, {
        title: string
        description: string
        checked: boolean
        comment: string
    }>
    comments?: string
}

export default function ApplicationDetailPage() {
    const router = useRouter()
    const params = useParams()
    const applicationId = params.id as string
    const { user, userData } = useAuth()
    const [application, setApplication] = useState<Application | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState("")
    const [generatedSummary, setGeneratedSummary] = useState("")
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

    useEffect(() => {
        const fetchApplication = async () => {
            if (!user) {
                router.push("/login")
                return
            }

            // 기업회원이 아니면 접근 불가
            if (userData?.role !== "company") {
                alert("기업 회원만 접근할 수 있습니다.")
                router.push("/jobs")
                return
            }

            if (!applicationId) return

            try {
                const docRef = doc(db, "applications", applicationId)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as Application
                    
                    // 자신이 올린 공고의 지원서만 볼 수 있음
                    if (data.jobCreatorId !== user.uid) {
                        alert("접근 권한이 없습니다.")
                        router.push("/admin/applications")
                        return
                    }
                    
                    setApplication(data)
                    setSelectedStatus(data.status || "접수")
                } else {
                    alert("지원서를 찾을 수 없습니다.")
                    router.push("/admin/applications")
                }
            } catch (error) {
                console.error("지원서 조회 실패:", error)
                alert("지원서 조회에 실패했습니다.")
                router.push("/admin/applications")
            } finally {
                setIsLoading(false)
            }
        }

        if (userData !== null) {
            fetchApplication()
        }
    }, [applicationId, user, userData, router])

    const handleStatusUpdate = async () => {
        if (!application || !applicationId) return

        try {
            const docRef = doc(db, "applications", applicationId)
            await updateDoc(docRef, {
                status: selectedStatus
            })
            
            setApplication({ ...application, status: selectedStatus })
            alert("상태가 업데이트되었습니다.")
        } catch (error) {
            console.error("상태 업데이트 실패:", error)
            alert("상태 업데이트에 실패했습니다.")
        }
    }

    const generateSummary = async () => {
        if (!application?.checklistDetails) return

        setIsGeneratingSummary(true)
        try {
            const response = await fetch("/api/summarize-application", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    checklistDetails: application.checklistDetails,
                    jobTitle: application.jobTitle,
                    seekerName: application.seekerName,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setGeneratedSummary(data.summary)
                
                // AI 요약을 DB에 저장
                const docRef = doc(db, "applications", applicationId)
                await updateDoc(docRef, {
                    aiSummary: data.summary
                })
            } else {
                alert("AI 요약 생성에 실패했습니다.")
            }
        } catch (error) {
            console.error("AI 요약 생성 실패:", error)
            alert("AI 요약 생성 중 오류가 발생했습니다.")
        } finally {
            setIsGeneratingSummary(false)
        }
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

    if (!application) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600">지원서를 찾을 수 없습니다.</div>
            </div>
        )
    }

    const checklistEntries = application.checklistDetails 
        ? Object.entries(application.checklistDetails)
        : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <button
                        onClick={() => router.push("/admin/applications")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">목록으로</span>
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{application.seekerName || application.seekerEmail}</h1>
                            <p className="text-sm text-gray-500 mt-1">{application.seekerEmail}</p>
                            <p className="text-sm text-gray-500 mt-1">지원 공고: {application.jobTitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="접수">접수</option>
                                <option value="면접 검토">면접 검토</option>
                                <option value="합격">합격</option>
                                <option value="불합격">불합격</option>
                                <option value="보류">보류</option>
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                상태 업데이트
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    {/* AI Summary Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">AI 요약</h2>
                        </div>
                        <div className="bg-white rounded-lg p-5 shadow-sm">
                            {isGeneratingSummary ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-gray-600">AI가 답변을 분석하고 있습니다...</span>
                                    </div>
                                </div>
                            ) : generatedSummary ? (
                                <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
{generatedSummary}
                                </pre>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <p className="text-gray-500 mb-4">AI 요약이 아직 생성되지 않았습니다.</p>
                                    <button
                                        onClick={generateSummary}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        AI 요약 생성하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Application Info Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">지원 정보</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">지원 일시:</span>
                                <span className="ml-2 text-gray-900 font-medium">
                                    {new Date(application.appliedAt).toLocaleString('ko-KR')}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">현재 상태:</span>
                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                                    application.status === "접수" || application.status === "면접 검토"
                                        ? "bg-orange-100 text-orange-700"
                                        : application.status === "합격"
                                        ? "bg-green-100 text-green-700"
                                        : application.status === "불합격"
                                        ? "bg-red-100 text-red-700"
                                        : application.status === "보류"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}>
                                    {application.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Responses */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">전체 답변</h2>
                            
                            {checklistEntries.length === 0 ? (
                                <p className="text-gray-500 text-sm">작성된 경험이 없습니다.</p>
                            ) : (
                                <div className="space-y-6">
                                {checklistEntries.map(([itemId, item], index) => {
                                    const colors = [
                                        { border: "border-l-blue-500", bg: "bg-blue-50" },
                                        { border: "border-l-indigo-500", bg: "bg-indigo-50" },
                                        { border: "border-l-cyan-500", bg: "bg-cyan-50" },
                                        { border: "border-l-sky-500", bg: "bg-sky-50" },
                                        { border: "border-l-blue-600", bg: "bg-blue-100" },
                                    ]
                                    const color = colors[index % colors.length]

                                    return (
                                        <div 
                                            key={itemId} 
                                            className={`border-l-4 ${color.border} ${color.bg} rounded-r-lg p-5`}
                                        >
                                            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                    {item.comment || "작성된 내용이 없습니다."}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                </div>
                            )}
                    </div>

                    {/* Additional Comments */}
                    {application.comments && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">추가 코멘트</h2>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{application.comments}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
