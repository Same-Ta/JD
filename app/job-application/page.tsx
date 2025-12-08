"use client"

import { useState } from "react"
import ChecklistItem from "../components/checklist-item"
import Button from "../components/ui/button"

interface Requirement {
  id: string
  title: string
  description: string
  completed: boolean
  evidence: string
}

const mockJob = {
  title: "프론트엔드 엔지니어",
  company: "테크 스타트업",
  companyDescription: "혁신적인 웹 기술로 미래를 만드는 회사",
  location: "서울, 강남구",
  salary: "5,000만원 - 6,500만원",
  requirements: [
    {
      id: "1",
      title: "React 및 TypeScript 경험",
      description: "React 18 이상에서 3년 이상의 실무 경험",
    },
    {
      id: "2",
      title: "반응형 웹 디자인 구현",
      description: "모바일 및 데스크톱에 최적화된 UI 구현 능력",
    },
    {
      id: "3",
      title: "REST API 통합",
      description: "백엔드 API와의 데이터 연동 경험",
    },
    {
      id: "4",
      title: "성능 최적화",
      description: "번들 크기 최적화, 렌더링 성능 개선 경험",
    },
    {
      id: "5",
      title: "팀 협업 경험",
      description: "Git을 활용한 팀 프로젝트 경험 및 코드 리뷰",
    },
  ],
}

export default function JobApplicationPage() {
  const [requirements, setRequirements] = useState<Requirement[]>(
    mockJob.requirements.map((req) => ({
      ...req,
      completed: false,
      evidence: "",
    })),
  )

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleRequirement = (id: string) => {
    setRequirements(requirements.map((req) => (req.id === id ? { ...req, completed: !req.completed } : req)))
  }

  const updateEvidence = (id: string, evidence: string) => {
    setRequirements(requirements.map((req) => (req.id === id ? { ...req, evidence } : req)))
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const completedCount = requirements.filter((req) => req.completed).length
  const progress = Math.round((completedCount / requirements.length) * 100)

  const handleApply = () => {
    const allCompleted = requirements.every((req) => req.completed)
    if (!allCompleted) {
      alert("모든 요구사항을 완료해주세요.")
      return
    }
    alert("지원이 완료되었습니다!")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {mockJob.company} • {mockJob.location}
              </p>
              <h1 className="text-4xl font-bold text-foreground mb-2">{mockJob.title}</h1>
              <p className="text-lg text-muted-foreground">{mockJob.companyDescription}</p>
            </div>

            {/* Job Info */}
            <div className="flex gap-6 pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">연봉</p>
                <p className="font-semibold text-foreground">{mockJob.salary}</p>
              </div>
              <div>
                <p className="text-muted-foreground">위치</p>
                <p className="font-semibold text-foreground">{mockJob.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">자격요건 체크리스트</h2>
            <span className="text-sm font-semibold text-primary">
              {completedCount}/{requirements.length} 완료
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{progress}% 진행률</p>
        </div>

        {/* Requirements List */}
        <div className="space-y-3 mb-32">
          {requirements.map((requirement) => (
            <ChecklistItem
              key={requirement.id}
              requirement={requirement}
              isExpanded={expandedId === requirement.id}
              onToggle={toggleRequirement}
              onUpdateEvidence={updateEvidence}
              onToggleExpand={toggleExpand}
            />
          ))}
        </div>
      </div>

      {/* Floating Apply Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {completedCount === requirements.length
                ? "모든 요구사항을 완료했습니다!"
                : `${requirements.length - completedCount}개 항목 남음`}
            </p>
          </div>
          <Button
            onClick={handleApply}
            size="lg"
            className="px-8 py-6 text-base font-semibold"
            disabled={completedCount < requirements.length}
          >
            지금 지원하기
          </Button>
        </div>
      </div>
    </div>
  )
}
