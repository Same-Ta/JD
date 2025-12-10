"use client"

import React, { useRef, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"

export type Requirement = {
  id: string
  title: string
  description: string
  completed: boolean
  evidence: string
}

type Props = {
  requirement: Requirement
  isExpanded: boolean
  onToggle: (id: string) => void
  onUpdateEvidence: (id: string, evidence: string) => void
  onToggleExpand: (id: string) => void
}

export default function ChecklistItem({ requirement, isExpanded, onToggle, onUpdateEvidence, onToggleExpand }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateEvidence(requirement.id, e.target.value)
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(200, textareaRef.current.scrollHeight)}px`
    }
  }

  useEffect(() => {
    if (textareaRef.current && isExpanded) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(200, textareaRef.current.scrollHeight)}px`
    }
  }, [isExpanded])

  return (
    <div
      className="border border-border rounded-lg bg-card overflow-hidden transition-all duration-300 hover:border-primary/50"
      aria-expanded={isExpanded}
    >
      <div
        onClick={() => onToggleExpand(requirement.id)}
        className="p-4 cursor-pointer flex items-start gap-4 hover:bg-secondary/50 transition-colors"
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle(requirement.id)
          }}
          aria-pressed={requirement.completed}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            requirement.completed ? "bg-primary border-primary" : "border-border hover:border-primary"
          }`}
        >
          {requirement.completed && <Check className="w-4 h-4 text-primary-foreground" />}
        </button>

        <div className="flex-1">
          <h3
            className={`font-semibold text-lg ${
              requirement.completed ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {requirement.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
        </div>

        <ChevronDown
          className={`flex-shrink-0 w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Animated collapsible content */}
      <div
        role="region"
        aria-hidden={!isExpanded}
        className={`border-t border-border bg-secondary/30 transition-all duration-300 ease-in-out ${
          isExpanded ? "p-6" : "p-0 max-h-0 overflow-hidden"
        }`}
      >
        {isExpanded && (
          <div className="space-y-3">
            <div className="w-full">
              <label className="text-sm font-semibold text-foreground block mb-3">증명 자료 / 포트폴리오 링크 작성</label>
              <textarea
                ref={textareaRef}
                value={requirement.evidence}
                onChange={handleTextareaChange}
                placeholder="예: 프로젝트 링크, 코드 샘플, 인증 자료 등을 작성해주세요"
                className="w-full p-4 rounded-lg border-2 border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
                style={{ minHeight: '250px', height: 'auto' }}
              />
            </div>
            <p className="text-xs text-muted-foreground">팁: 구체적인 프로젝트 예시, 링크, 또는 경험을 작성하면 더 강력한 지원서가 됩니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
