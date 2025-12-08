"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import PageShell from "../../components/page-shell"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"

type Application = {
  id: string
  appliedAt: string
  jobTitle: string
  team: string
  status: "서류 검토중" | "합격" | "불합격" | "면접 진행중"
}

function StatusBadge({ status }: { status: Application["status"] }) {
  const variants: Record<Application["status"], string> = {
    "합격": "bg-emerald-600 hover:bg-emerald-700",
    "불합격": "bg-rose-600 hover:bg-rose-700",
    "면접 진행중": "bg-blue-600 hover:bg-blue-700",
    "서류 검토중": "bg-amber-500 hover:bg-amber-600",
  }
  return <Badge className={variants[status]}>{status}</Badge>
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApplications() {
      try {
        console.log("🚀 데이터 가져오기 시작...")
        
        const snapshot = await getDocs(collection(db, "applications"))
        
        console.log("🔥 전체 지원 내역 개수:", snapshot.size)
        
        const rawData = snapshot.docs.map(doc => doc.data())
        console.log("📦 데이터 목록:", rawData)
        
        const apps: Application[] = snapshot.docs
          .map(doc => ({
            id: doc.id,
            appliedAt: doc.data().appliedAt || "",
            jobTitle: doc.data().jobTitle || "제목 없음",
            team: doc.data().team || "",
            status: doc.data().status || "상태 미정",
          }))
          .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        
        console.log(`✅ 가져온 개수: ${apps.length}개`)
        setApplications(apps)
      } catch (error) {
        console.error("❌ Failed to fetch applications:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  return (
    <PageShell title="나의 지원 현황" subtitle="지원한 공고의 상태를 한 눈에 확인하세요.">
      <div className="mt-6">
        {loading ? (
          <Card className="p-12 text-center text-muted-foreground">지원 내역을 불러오는 중...</Card>
        ) : applications.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-4">
            <p className="text-lg text-muted-foreground">아직 지원한 공고가 없습니다.</p>
            <Button asChild>
              <Link href="/jobs">공고 보러 가기</Link>
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {applications.map(app => (
                <Card key={app.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/seeker/apply/${app.id}`}
                        className="text-sm font-semibold text-foreground hover:text-primary block truncate"
                      >
                        {app.jobTitle || "제목 없음"}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {app.team} • {new Date(app.appliedAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <StatusBadge status={app.status || "상태 미정"} />
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
        <details className="mt-6 p-4 bg-gray-100 rounded text-xs">
          <summary className="cursor-pointer font-semibold">원본 데이터 (디버깅용)</summary>
          <pre className="mt-2 overflow-auto max-h-48">{JSON.stringify(applications, null, 2)}</pre>
        </details>
      </div>
    </PageShell>
  )
}
