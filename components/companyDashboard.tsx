"use client"

import React, { useState, useEffect } from "react"
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
} from "firebase/firestore"
import { db, auth } from "../lib/firebase"

interface ChecklistItem {
    id: string
    category: string
    content: string
}

interface Job {
    id: string
    summary: string
    team: string
    createdAt: string
    creatorId: string
    checklist?: ChecklistItem[]
}

interface Application {
    id: string
    jobId: string
    jobTitle: string
    seekerEmail: string
    appliedDate: string
    status: string
    checkedItems: Record<string, boolean>
    comments: string
    checklistDetails?: Record<string, { content: string; checked: boolean; comment: string }>
}

export default function CompanyDashboard() {
    const [myJobs, setMyJobs] = useState<Job[]>([])
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Step 1: Fetch user's job postings
    useEffect(() => {
        const fetchJobs = async () => {
            if (!auth.currentUser) return

            try {
                const q = query(
                    collection(db, "jobs"),
                    where("creatorId", "==", auth.currentUser.uid),
                    orderBy("createdAt", "desc")
                )

                const querySnapshot = await getDocs(q)
                const docs: Job[] = []

                querySnapshot.forEach((doc) => {
                    const jobData = doc.data()
                    docs.push({
                        id: doc.id,
                        summary: jobData.summary || "",
                        team: jobData.team || "",
                        createdAt: jobData.createdAt || "",
                        creatorId: jobData.creatorId || "",
                        checklist: jobData.checklist || [],
                    } as Job)
                })

                setMyJobs(docs)
            } catch (error) {
                console.error("Error fetching jobs:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchJobs()
    }, [])

    // Step 2: Fetch applications for selected job
    const handleJobClick = async (job: Job) => {
        setSelectedJob(job)
        setExpandedId(null)

        try {
            const q = query(
                collection(db, "applications"),
                where("jobId", "==", job.id)
            )

            const querySnapshot = await getDocs(q)
            const docs: Application[] = []

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data()
                console.log('Application raw data:', data) // 디버깅
                console.log('checklistDetails from DB:', data.checklistDetails) // 디버깅
                docs.push({
                    id: docSnap.id,
                    jobId: data.jobId || "",
                    jobTitle: data.jobTitle || "",
                    seekerEmail: data.seekerEmail || "",
                    appliedDate: data.appliedDate || data.appliedAt || "",
                    status: data.status || "검토 중",
                    checkedItems: data.checkedItems || {},
                    comments: data.comments || "",
                    checklistDetails: data.checklistDetails || undefined,
                })
            })

            setApplications(docs)
        } catch (error) {
            console.error("Error fetching applications:", error)
        }
    }

    const handleBackToList = () => {
        setSelectedJob(null)
        setApplications([])
        setExpandedId(null)
    }

    const updateStatus = async (
        applicationId: string,
        newStatus: "합격" | "불합격"
    ) => {
        console.log("상태 변경 요청:", applicationId, newStatus)

        // 낙관적 업데이트: UI를 먼저 변경
        const previousApplications = applications
        setApplications((prev) =>
            prev.map((app) =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            )
        )

        try {
            const docRef = doc(db, "applications", applicationId)
            await updateDoc(docRef, { status: newStatus })
            console.log("✅ DB 업데이트 완료")
        } catch (error) {
            console.error("상태 변경 실패:", error)
            alert("상태 변경 실패")
            // 실패 시 이전 상태로 복원
            setApplications(previousApplications)
        }
    }

    const deleteJob = async (jobId: string) => {
        if (!window.confirm("정말로 이 공고를 삭제하시겠습니까?")) {
            return
        }

        try {
            await deleteDoc(doc(db, "jobs", jobId))
            setMyJobs((prev) => prev.filter((job) => job.id !== jobId))
            alert("공고가 삭제되었습니다.")
        } catch (error) {
            console.error("공고 삭제 실패:", error)
            alert("공고 삭제에 실패했습니다.")
        }
    }

    if (loading) return (
        <div className="p-6 text-gray-500 glass-card rounded-2xl flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            로딩 중...
        </div>
    )

    // Case A: Job List View
    if (!selectedJob) {
        return (
            <div className="py-6">
                <h2 className="text-xl font-bold mb-6 text-gradient">내 공고 목록</h2>

                {myJobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 glass-card rounded-2xl">
                        올린 공고가 없습니다.
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {myJobs.map((job, index) => {
                            const colors = ["bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-cyan-500", "bg-sky-500", "bg-blue-600"]
                            return (
                                <div
                                    key={job.id}
                                    className="glass-card hover-glow rounded-2xl p-5"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`w-1.5 h-12 rounded-full ${colors[index % colors.length]}`}></div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-gray-800">{job.summary}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">팀: {job.team}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-4 pl-4">
                                        {new Date(job.createdAt).toLocaleDateString("ko-KR")}
                                    </p>
                                    <div className="flex gap-2 pl-4">
                                        <button
                                            onClick={() => handleJobClick(job)}
                                            className="flex-1 px-4 py-2 btn-gradient text-white rounded-xl hover:opacity-90 text-sm font-medium transition-all"
                                        >
                                            지원자 확인 →
                                        </button>
                                        <button
                                            onClick={() => deleteJob(job.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-medium transition-colors"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    // Case B: Application Detail View
    return (
        <div className="py-6">
            <button
                onClick={handleBackToList}
                className="mb-6 px-4 py-2 bg-white/50 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/80 text-sm font-medium transition-all border border-white/30"
            >
                ← 목록으로 돌아가기
            </button>

            {/* Selected Job Header */}
            <div className="rounded-2xl p-6 mb-6 glass-card glow-sm">
                <h2 className="text-xl font-bold mb-2 text-gradient">{selectedJob.summary}</h2>
                <p className="text-sm text-gray-500">팀: {selectedJob.team}</p>
                <p className="text-xs text-gray-400">
                    {new Date(selectedJob.createdAt).toLocaleDateString("ko-KR")}
                </p>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto rounded-2xl glass-card">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/50 border-b border-white/30">
                            <th className="p-4 text-left text-sm font-semibold text-gray-700">
                                지원자 이메일
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-700">지원 날짜</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-700">상태</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-700">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <React.Fragment key={app.id}>
                                <tr
                                    className="cursor-pointer hover:bg-white/50 transition-colors border-b border-white/30"
                                    onClick={() =>
                                        setExpandedId(expandedId === app.id ? null : app.id)
                                    }
                                >
                                    <td className="p-4 text-sm text-gray-800">
                                        {app.seekerEmail}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(app.appliedDate).toLocaleDateString("ko-KR")}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                app.status === "합격"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : app.status === "불합격"
                                                        ? "bg-rose-100 text-rose-700"
                                                        : "bg-amber-100 text-amber-700"
                                            }`}
                                        >
                                            {app.status === "합격"
                                                ? "합격"
                                                : app.status === "불합격"
                                                    ? "불합격"
                                                    : "검토 중"}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                updateStatus(app.id, "합격")
                                            }}
                                            className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium transition-colors"
                                        >
                                            합격
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                updateStatus(app.id, "불합격")
                                            }}
                                            className="px-4 py-1.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 text-sm font-medium transition-colors"
                                        >
                                            불합격
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === app.id && (
                                    <tr className="bg-white/30 border-b border-white/30">
                                        <td colSpan={4} className="p-6">
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gradient mb-4">📋 지원자 체크리스트 응답</h3>
                                                
                                                {(() => {
                                                    const colors = ["border-l-pink-400", "border-l-orange-400", "border-l-purple-400", "border-l-cyan-400", "border-l-green-400", "border-l-blue-400"];
                                                    
                                                    console.log('Rendering app.checklistDetails:', app.checklistDetails); // 디버깅
                                                    
                                                    // 새로운 checklistDetails 형식 사용
                                                    if (app.checklistDetails && Object.keys(app.checklistDetails).length > 0) {
                                                        return (
                                                            <div className="space-y-3">
                                                                {Object.entries(app.checklistDetails).map(([id, detail]: [string, any], index) => {
                                                                    console.log('Rendering detail:', id, detail); // 디버깅
                                                                    // title이 있으면 title 사용, 없으면 content 사용
                                                                    const itemTitle = detail.title || detail.content || `항목 #${id}`;
                                                                    const itemDescription = detail.description || '';
                                                                    console.log('itemTitle:', itemTitle); // 디버깅
                                                                    
                                                                    return (
                                                                        <div 
                                                                            key={id} 
                                                                            className={`glass-card rounded-xl p-4 border-l-4 ${colors[index % colors.length]}`}
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${detail.checked ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                                                    {detail.checked ? "✓" : "✗"}
                                                                                </span>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-medium text-gray-800 text-sm">{itemTitle}</p>
                                                                                    {itemDescription && (
                                                                                        <p className="text-xs text-gray-400 mt-0.5">{itemDescription}</p>
                                                                                    )}
                                                                                    {detail.comment ? (
                                                                                        <div className="mt-2 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                                                                                            <p className="text-xs text-gray-400 mb-1">💬 지원자 코멘트</p>
                                                                                            <p className="text-sm text-gray-600 leading-relaxed">{detail.comment}</p>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-400 mt-1 italic">코멘트 없음</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }

                                                    // 기존 데이터 호환성: selectedJob의 checklist에서 내용 가져오기
                                                    let parsedComments: Record<string, string> = {};
                                                    try {
                                                        if (typeof app.comments === 'string' && app.comments.startsWith('{')) {
                                                            parsedComments = JSON.parse(app.comments);
                                                        }
                                                    } catch (e) {
                                                        console.error('Comments parse error:', e);
                                                    }

                                                    // selectedJob에서 체크리스트 내용 매핑
                                                    const checklistMap: Record<string, { title: string; description: string }> = {};
                                                    if (selectedJob?.checklist && Array.isArray(selectedJob.checklist)) {
                                                        selectedJob.checklist.forEach((item: any, idx) => {
                                                            // id가 있으면 id로, 없으면 인덱스+1로 매핑
                                                            const itemId = item.id || String(idx + 1);
                                                            checklistMap[itemId] = {
                                                                title: item.title || item.content || item.category || `항목 ${idx + 1}`,
                                                                description: item.description || ''
                                                            };
                                                        });
                                                    }

                                                    const checkedItems = app.checkedItems || {};
                                                    // checkedItems가 배열인 경우 처리
                                                    let checkedItemIds: string[] = [];
                                                    if (Array.isArray(checkedItems)) {
                                                        checkedItemIds = checkedItems;
                                                    } else {
                                                        checkedItemIds = Object.keys(checkedItems).filter(k => checkedItems[k]);
                                                    }

                                                    const allItemIds = new Set([
                                                        ...checkedItemIds,
                                                        ...Object.keys(parsedComments)
                                                    ]);

                                                    if (allItemIds.size === 0) {
                                                        return (
                                                            <p className="text-sm text-gray-400 italic">제출된 체크리스트가 없습니다.</p>
                                                        );
                                                    }

                                                    return (
                                                        <div className="space-y-3">
                                                            {Array.from(allItemIds).map((itemId, index) => {
                                                                const isChecked = checkedItemIds.includes(itemId) || checkedItems[itemId] === true;
                                                                const comment = parsedComments[itemId] || '';
                                                                // 체크리스트 내용 가져오기 (없으면 ID 표시)
                                                                const itemData = checklistMap[itemId];
                                                                const itemTitle = itemData?.title || `항목 #${itemId}`;
                                                                const itemDescription = itemData?.description || '';
                                                                
                                                                return (
                                                                    <div 
                                                                        key={itemId} 
                                                                        className={`glass-card rounded-xl p-4 border-l-4 ${colors[index % colors.length]}`}
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                                                {isChecked ? "✓" : "✗"}
                                                                            </span>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-gray-800 text-sm">{itemTitle}</p>
                                                                                {itemDescription && (
                                                                                    <p className="text-xs text-gray-400 mt-0.5">{itemDescription}</p>
                                                                                )}
                                                                                {comment ? (
                                                                                    <div className="mt-2 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                                                                                        <p className="text-xs text-gray-400 mb-1">💬 지원자 코멘트</p>
                                                                                        <p className="text-sm text-gray-600 leading-relaxed">{comment}</p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-xs text-gray-400 mt-1 italic">코멘트 없음</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {applications.length === 0 && (
                <div className="text-center py-12 text-gray-500 glass-card rounded-2xl">
                    지원 내역이 없습니다.
                </div>
            )}
        </div>
    )
}