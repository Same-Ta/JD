"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card } from "../../../components/ui/card"
import Button from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { Check } from "lucide-react"
import { db } from "../../../../lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useAuth } from "../../../../context/AuthContext"

type ChecklistItem = {
    id: string
    title: string
    description: string
    category?: string
    content?: string
}

type JobInfo = {
    id: string
    summary: string
    company: string
    deadline: string
    location: string
    team?: string
    creatorId?: string
    checklist: ChecklistItem[]
}

export default function ApplyPage() {
    const router = useRouter()
    const params = useParams()
    const jobId = params.id as string
    const { user } = useAuth() // Get current user

    const [jobInfo, setJobInfo] = useState<JobInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [checkedItems, setCheckedItems] = useState<string[]>([])
    const [comments, setComments] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchJobInfo = async () => {
            if (!jobId) return

            try {
                const jobDoc = await getDoc(doc(db, "jobs", jobId))
                if (jobDoc.exists()) {
                    setJobInfo({ id: jobDoc.id, ...jobDoc.data() } as JobInfo)
                } else {
                    alert("공고를 찾을 수 없습니다.")
                    router.push("/jobs")
                }
            } catch (error) {
                console.error("공고 조회 실패:", error)
                alert("공고 조회에 실패했습니다.")
                router.push("/jobs")
            } finally {
                setIsLoading(false)
            }
        }

        fetchJobInfo()
    }, [jobId, router])

    const handleToggleCheck = (id: string) => {
        setCheckedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const handleCommentChange = (id: string, value: string) => {
        setComments((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async () => {
        // Check if user is logged in
        if (!user) {
            alert("로그인이 필요합니다.")
            router.push("/login")
            return
        }

        if (!jobInfo) {
            alert("공고 정보가 없습니다.")
            return
        }

        const checklist = jobInfo.checklist || []
        
        // 모든 체크리스트 항목이 체크되었는지 확인
        const allChecked = checklist.every(item => checkedItems.includes(item.id))
        if (!allChecked) {
            alert("모든 체크리스트 항목을 체크해주세요.")
            return
        }

        // 모든 체크리스트 항목에 코멘트가 작성되었는지 확인
        const allCommented = checklist.every(item => comments[item.id]?.trim())
        if (!allCommented) {
            alert("모든 체크리스트 항목에 코멘트를 작성해주세요.")
            return
        }

        setIsSubmitting(true)

        try {
            // 체크리스트 항목의 ID와 title/description을 매핑
            const checklistWithContent: Record<string, { title: string; description: string; checked: boolean; comment: string }> = {};
            jobInfo.checklist?.forEach((item: any) => {
                console.log('Saving checklist item:', item); // 디버깅
                checklistWithContent[item.id] = {
                    title: item.title || item.content || "",
                    description: item.description || "",
                    checked: checkedItems.includes(item.id),
                    comment: comments[item.id] || ""
                };
            });
            console.log('checklistWithContent:', checklistWithContent); // 디버깅

            const response = await fetch("/api/apply-job", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    seekerId: user.uid,
                    seekerEmail: user.email,
                    seekerName: user.displayName || "",
                    jobId: jobId,
                    jobTitle: jobInfo.summary,
                    jobCreatorId: jobInfo.creatorId || "",
                    team: jobInfo.team || "",
                    checkedItems: checkedItems,
                    comments: comments,
                    checklistDetails: checklistWithContent, // 체크리스트 상세 정보 추가
                }),
            })

            if (!response.ok) {
                throw new Error("API request failed")
            }

            alert("지원 완료!")
            router.push("/mypage")
        } catch (error) {
            console.error("지원 실패:", error)
            alert("지원 실패")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center gradient-bg">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="text-gray-600 flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        공고 로딩 중...
                    </div>
                </div>
            </div>
        )
    }

    if (!jobInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center gradient-bg">
                <div className="glass-card p-6 rounded-2xl">
                    <p className="text-gray-500">공고를 불러올 수 없습니다.</p>
                </div>
            </div>
        )
    }

    const companyInitial = jobInfo.company?.[0] ?? "?"
    const checklist = jobInfo.checklist ?? []

    // 제목 필드명 매핑
    const jobTitle = jobInfo.summary || (jobInfo as any).title || (jobInfo as any).jobTitle || "제목 없음"

    return (
        <div className="min-h-screen pb-28 gradient-bg">
            {/* Header */}
            <header className="max-w-4xl mx-auto px-6 py-8">
                <div className="glass-card glow rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg glow-sm">
                            {companyInitial}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gradient">{jobTitle}</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {jobInfo.company || "Company Name"}
                            </p>
                            <div className="flex gap-4 mt-3 text-xs text-gray-400">
                                <span>📍 {jobInfo.location}</span>
                                <span>📅 마감일: {jobInfo.deadline}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6">
                <section className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-lg font-bold text-gradient">지원 전 체크리스트</h2>
                        <p className="text-sm text-gray-500 mt-2">
                            필요한 경험이나 스킬을 선택하고 상세 내용을 작성해주세요.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {checklist.map((item, index) => {
                            const isChecked = checkedItems.includes(item.id)
                            const itemCategory = item.category || (item as any).title || (item as any).label || "카테고리 없음"
                            const itemContent = item.content || (item as any).description || (item as any).desc || "내용 없음"
                            
                            // 체크리스트 색상 - 블루 테마
                            const colors = ["bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-cyan-500", "bg-sky-500", "bg-blue-600"]

                            return (
                                <div
                                    key={item.id}
                                    className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                                        isChecked ? "ring-2 ring-blue-500 glow-sm" : ""
                                    }`}
                                    onClick={() => handleToggleCheck(item.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Color bar */}
                                        <div className={`w-1.5 h-10 rounded-full ${colors[index % colors.length]}`}></div>
                                        
                                        {/* Checkbox */}
                                        <div
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                                isChecked
                                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500"
                                                    : "border-gray-300 bg-white"
                                            }`}
                                        >
                                            {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-gray-800">{itemCategory}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {itemContent}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Accordion Effect */}
                                    {isChecked && (
                                        <div className="mt-4 ml-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Textarea
                                                placeholder="이 항목과 관련된 경험을 자세히 설명해주세요..."
                                                value={comments[item.id] || ""}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                    handleCommentChange(item.id, e.target.value)
                                                }
                                                onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => e.stopPropagation()}
                                                className="text-xs resize-none bg-white border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>
            </main>

            {/* Sticky Footer - Fixed at Bottom */}
            <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 py-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">{checkedItems.length}</span>/{checklist.length} 항목 선택
                    </div>
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        disabled={isSubmitting}
                        className="px-8 py-3 btn-gradient text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
                    >
                        {isSubmitting ? "제출 중..." : "지원하기"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
