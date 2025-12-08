"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { db } from "../../lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { useAuth } from "../../context/AuthContext"
import { PenSquare, MoreVertical } from "lucide-react"

type Job = {
	id: string
	summary: string
	team: string
	createdAt: string
	tags?: string[]
}

// 카드별 컬러 (왼쪽 바 색상) - 블루 테마
const cardColors = [
	"bg-blue-500",
	"bg-blue-400", 
	"bg-indigo-500",
	"bg-cyan-500",
	"bg-sky-500",
	"bg-blue-600",
]

// 시간 포맷 함수
function formatTimeAgo(dateString: string): string {
	if (!dateString) return ""
	try {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)
		
		if (diffMins < 60) return `${diffMins}분 전`
		if (diffHours < 24) return `${diffHours}시간 전`
		if (diffDays < 7) return `${diffDays}일 전`
		return dateString
	} catch {
		return dateString
	}
}

export default function JobsPage() {
	const [jobs, setJobs] = useState<Job[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()
	const { userData } = useAuth()

	useEffect(() => {
		const fetchJobs = async () => {
			try {
				const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"))
				const snapshot = await getDocs(q)
				const jobsList = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Job[]
				setJobs(jobsList)
			} catch (error) {
				console.error("공고 불러오기 실패:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchJobs()
	}, [])

	return (
		<div className="min-h-screen p-8">
			<main className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-gradient">채용공고</h2>
                    <p className="text-gray-400 mt-2">새로운 기회를 찾아보세요</p>
                </header>				<section>
					{isLoading ? (
						<div className="text-center text-gray-500 py-12">공고 불러오는 중...</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{jobs.map((job, index) => (
								<Link
									key={job.id}
									href={`/seeker/apply/${job.id}`}
									className="block group"
									aria-label={`${job.team} ${job.summary} 상세보기`}
								>
									<div className="card-glass rounded-2xl p-5 transition-all duration-300 relative hover-glow">
										{/* Color Bar + Title */}
										<div className="flex items-start gap-3 mb-1">
											<div className={`w-1.5 h-12 rounded-full ${cardColors[index % cardColors.length]}`}></div>
											<div className="flex-1">
												<h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
													{job.summary || "제목 없음"}
												</h3>
												<p className="text-xs text-gray-500 mt-0.5">
													{formatTimeAgo(job.createdAt)}
												</p>
											</div>
										</div>

										{/* Description */}
										<p className="text-sm text-gray-400 mt-3 mb-4 pl-4 line-clamp-2">
											{job.team || "팀 정보 없음"}
										</p>

										{/* Footer: Avatars + More button */}
										<div className="flex items-center justify-between pl-4">
											{/* Avatar Stack */}
											<div className="flex -space-x-2">
												<div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-white"></div>
												<div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-white"></div>
											</div>
											
											{/* More button */}
											<button 
												onClick={(e) => e.preventDefault()}
												className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
											>
												<MoreVertical size={18} />
											</button>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</section>
			</main>

			{userData?.role === "company" && (
				<button
					onClick={() => router.push("/manager")}
					className="fixed bottom-8 right-8 w-14 h-14 rounded-full btn-gradient shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 z-50 glow"
					aria-label="공고 작성"
				>
					<PenSquare size={24} />
				</button>
			)}
		</div>
	)
}
