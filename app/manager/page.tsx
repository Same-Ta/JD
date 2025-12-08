"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { useAuth } from "../../context/AuthContext"

type Message = {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: string
}

type ChecklistItem = {
  id: string
  title: string
  description: string
}

type JobData = {
  team: string
  summary: string
  checklist: ChecklistItem[]
}

export default function ManagerPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // 상태 관리
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [jobData, setJobData] = useState<JobData>({
    team: "",
    summary: "",
    checklist: [],
  })

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // 채팅 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isTyping])

  // 메시지 전송 이벤트
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    console.log("1. 전송 버튼 클릭됨, 입력값:", input)
    
    const text = input.trim()
    if (!text) return

    console.log("2. 유효성 검사 통과")
    
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      console.log("3. API 호출 시작 (/api/generate-job)")
      const response = await fetch("/api/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, userMsg: text }),
      })
      const respText = await response.text()
      let data: any = null
      try {
        data = JSON.parse(respText)
      } catch (err) {
        console.error("Failed to parse API response as JSON:", err, "raw:", respText)
      }

      if (!response.ok) {
        console.error("API returned non-OK status", response.status, respText)
        throw new Error(`API 요청 실패: ${respText || response.status}`)
      }
      console.log("4. API 응답 수신:", data)

      const aiMsg: Message = {
        id: `a_${Date.now()}`,
        sender: "ai",
        text: data.aiResponse,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])

      setJobData((prev) => ({
        ...prev,
        // AI가 제안한 title이 있고, 사용자가 아직 입력하지 않았으면 반영
        summary: prev.summary || data.title || prev.summary,
        checklist: data.checklist && data.checklist.length > 0 
          ? data.checklist.map((item: { category: string; content: string }, index: number) => ({
              id: `item_${Date.now()}_${index}`,
              title: item.category,
              description: item.content,
            }))
          : prev.checklist,
      }))
    } catch (error) {
      console.error("🚨 에러 발생:", error)
      alert("요청 처리 중 오류가 발생했습니다.")
    } finally {
      setIsTyping(false)
    }
  }

  // 공고 업로드 핸들러
  const handleUpload = async () => {
    if (!user) {
      alert("로그인이 필요합니다");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobData,
          creatorId: user.uid,
          creatorEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "업로드 실패");
      }

      alert("공고가 성공적으로 등록되었습니다!");
      router.push("/jobs");
    } catch (error) {
      console.error("🚨 업로드 에러:", error);
      alert(`업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 gradient-bg">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-3rem)]">
        {/* Left: Preview Card */}
        <div className="glass-card glow rounded-2xl p-6 overflow-y-auto">
          <h3 className="text-xl font-bold text-gradient mb-4">{jobData.summary || "직무명을 입력해주세요"}</h3>
          
          {/* 팀 입력 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">소속 팀</label>
            <input
              type="text"
              value={jobData.team}
              onChange={(e) => setJobData(prev => ({ ...prev, team: e.target.value }))}
              placeholder="예: 프론트엔드팀, 백엔드팀, 마케팅팀..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 직무명 입력 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">직무명 (요약)</label>
            <input
              type="text"
              value={jobData.summary}
              onChange={(e) => setJobData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="예: 백엔드 개발자, 프론트엔드 엔지니어..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            체크리스트 ({jobData.checklist.length}개 항목)
          </div>
          <ul className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
            {jobData.checklist.map((item) => (
              <li key={item.id} className="p-3 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <div className="font-semibold text-gray-800">{item.title}</div>
                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
              </li>
            ))}
            {jobData.checklist.length === 0 && (
              <li className="p-4 text-center text-gray-400 text-sm">
                AI와 대화하여 체크리스트를 생성해보세요
              </li>
            )}
          </ul>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !jobData.team || !jobData.summary}
            className="w-full py-3 btn-gradient hover:opacity-90 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "업로드 중..." : "공고 올리기"}
          </Button>
          {(!jobData.team || !jobData.summary) && (
            <p className="text-xs text-gray-400 text-center mt-2">
              팀과 직무명을 입력해야 공고를 올릴 수 있습니다
            </p>
          )}
        </div>

        {/* Right: Chat UI */}
        <div className="glass-card glow rounded-2xl p-6 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 && !isTyping && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg glow-sm">
                    <div className="w-6 h-6 bg-white/30 rounded rotate-45"></div>
                  </div>
                  <p className="text-gray-500 text-sm">AI에게 팀 관리 요청이나 질문을 입력해보세요.</p>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  m.sender === "user" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                    : "bg-white/80 backdrop-blur-sm text-gray-800 border border-white/30"
                }`}>
                  <div className="text-sm leading-relaxed">{m.text}</div>
                  <div className={`text-[10px] mt-1 text-right ${m.sender === "user" ? "text-white/70" : "text-gray-400"}`}>
                    {new Date(m.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-600 text-sm border border-white/30">
                  <span className="animate-pulse">AI가 응답 중입니다…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-2 border border-white/30">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AI에게 요청을 입력해보세요..."
              className="flex-1 px-3 py-2 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 btn-gradient text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 hover:opacity-90 transition-all"
              disabled={isTyping}
            >
              <span>보내기</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
