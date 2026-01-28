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
    const { user } = useAuth()
    const [application, setApplication] = useState<Application | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState("")
    const [showFullAnswers, setShowFullAnswers] = useState(false)
    const [generatedSummary, setGeneratedSummary] = useState("")
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

    useEffect(() => {
        const fetchApplication = async () => {
            if (!user) {
                router.push("/login")
                return
            }

            if (!applicationId) return

            try {
                const docRef = doc(db, "applications", applicationId)
                const docSnap = await getDoc(docRef)
                
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as Application
                    setApplication(data)
                    setSelectedStatus(data.status || "검토 중")
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

        fetchApplication()
    }, [applicationId, user, router])

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
                    seekerName: application.seekerName,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setGeneratedSummary(data.summary || "")
                
                // DB에도 저장
                const docRef = doc(db, "applications", applicationId)
                await updateDoc(docRef, {
                    aiSummary: data.summary || ""
                })
            } else {
                alert("요약 생성에 실패했습니다.")
            }
        } catch (error) {
            console.error("요약 생성 실패:", error)
            alert("요약 생성 중 오류가 발생했습니다.")
        } finally {
            setIsGeneratingSummary(false)
        }
    }

    useEffect(() => {
        // aiSummary가 이미 있으면 표시
        if (application?.aiSummary) {
            setGeneratedSummary(application.aiSummary)
        }
    }, [application])

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
                <div className="text-gray-500">지원서를 불러올 수 없습니다.</div>
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
                            <h1 className="text-2xl font-bold text-gray-900">{application.seekerName || "이름 없음"}</h1>
                            <p className="text-sm text-gray-500 mt-1">{application.seekerEmail}</p>
                            <p className="text-sm text-gray-500 mt-1">지원 공고: {application.jobTitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="검토 중">검토 중</option>
                                <option value="면접 요청">면접 요청</option>
                                <option value="면접 예정">면접 예정</option>
                                <option value="합격">합격</option>
                                <option value="불합격">불합격</option>
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
                    {/* AI Summary Card - 항상 표시 */}
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
                                    application.status === "검토 중" || application.status === "면접 요청"
                                        ? "bg-orange-100 text-orange-700"
                                        : application.status === "면접 예정"
                                        ? "bg-blue-100 text-blue-700"
                                        : application.status === "합격"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}>
                                    {application.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Responses - 항상 표시 */}
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
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                                                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.checked 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-gray-100 text-gray-500"
                                                }`}>
                                                    {item.checked ? "✓ 보유" : "미보유"}
                                                </span>
                                            </div>
                                            
                                            {item.comment && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">📝 경험 상세</p>
                                                    <div className="bg-white rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                        {item.comment}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => router.push("/admin/applications")}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            목록으로
                        </button>
                        <button
                            onClick={() => {
                                if (confirm("이 지원자를 면접 예정으로 변경하시겠습니까?")) {
                                    setSelectedStatus("면접 예정")
                                    handleStatusUpdate()
                                }
                            }}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            면접 요청
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
