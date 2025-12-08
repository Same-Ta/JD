"use client"

import React from "react"

type Job = {
  title?: string
  level?: string
  responsibilities?: string[]
  requirements?: string[]
  benefits?: string[]
  salary?: string
  department?: string
  location?: string
}

export default function JobChecklistPreview({ jobDescription }: { jobDescription: Job }) {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{jobDescription?.title || "직무 미리보기"}</h2>
      <div className="text-sm text-muted-foreground">{jobDescription?.department || "부서 정보 없음"}</div>
      <div className="mt-2 text-sm">
        <strong>요구사항</strong>
        <ul className="list-disc pl-5 mt-2 text-muted-foreground">
          {(jobDescription?.requirements?.length ?? 0) > 0 ? (
            jobDescription.requirements!.map((r, i) => <li key={i}>{r}</li>)
          ) : (
            <li>요구사항이 입력되면 여기서 미리보기가 가능합니다.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
