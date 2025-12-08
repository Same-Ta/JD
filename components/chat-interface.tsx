"use client"

import React, { useState } from "react"
import { Send, MessageSquare, Grid3X3, ShoppingBag, Settings, Plus } from "lucide-react"

type Props = {
  onJobDescriptionUpdate?: (job: any) => void
}

const suggestedQuestions = [
  {
    icon: "🔷",
    iconColor: "bg-blue-500",
    title: "Help me to create a personal branding and web page",
  },
  {
    icon: "📊",
    iconColor: "bg-rose-400",
    title: "Write a report based on my website data",
  },
  {
    icon: "✨",
    iconColor: "bg-amber-400",
    title: "Write a tailored, engaging content, with a focus quality",
  },
]

export default function ChatInterface({ onJobDescriptionUpdate }: Props) {
  const [message, setMessage] = useState("")

  const sample = {
    title: "샘플 직무",
    level: "중급",
    responsibilities: ["UI 개발", "상태관리"],
    requirements: ["React", "TypeScript"],
    benefits: ["유연근무"],
    salary: "상담 후 결정",
    department: "엔지니어링",
    location: "서울",
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Message:", message)
      setMessage("")
    }
  }

  return (
    <div className="flex h-screen bg-[#F0F4F8]">
      {/* Left Sidebar */}
      <div className="w-16 bg-[#E8EEF4] flex flex-col items-center py-4 gap-6">
        {/* Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-white/20 rounded rotate-45"></div>
        </div>
        
        {/* Nav Icons */}
        <div className="flex flex-col gap-4 mt-4">
          <button className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
            <MessageSquare size={20} />
          </button>
          <button className="w-10 h-10 rounded-xl hover:bg-white/50 text-gray-500 flex items-center justify-center transition-colors">
            <Grid3X3 size={20} />
          </button>
          <button className="w-10 h-10 rounded-xl hover:bg-white/50 text-gray-500 flex items-center justify-center transition-colors">
            <ShoppingBag size={20} />
          </button>
          <button className="w-10 h-10 rounded-xl hover:bg-white/50 text-gray-500 flex items-center justify-center transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* User Avatar at bottom */}
        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center overflow-hidden">
            <span className="text-lg">👤</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/50">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">CentraAI 2.0</span>
              <span className="text-gray-400">▼</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Plus size={18} />
              <span className="text-sm font-medium">New Chat</span>
            </button>
          </div>
        </div>

        {/* Chat Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-b from-white/30 to-transparent rounded-tl-3xl">
          {/* Logo/Avatar */}
          <div className="mb-6 w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-white/30 rounded rotate-45"></div>
          </div>

          {/* Greeting */}
          <h1 className="text-2xl text-gray-600 mb-1">Hi, there 👋</h1>
          <p className="text-2xl font-semibold text-gray-800 mb-10">How can we help?</p>

          {/* Suggested Questions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-auto">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onJobDescriptionUpdate?.(sample)}
                className="p-5 rounded-xl bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer text-left"
              >
                <div className={`w-8 h-8 ${question.iconColor} rounded-lg flex items-center justify-center mb-3`}>
                  <span className="text-white text-sm">■</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {question.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-4">
          <div className="flex gap-3 max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 py-4 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="px-5 py-2 m-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              <span className="text-sm font-medium">Send</span>
            </button>
          </div>
          
          {/* Footer Note */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Centra may display inaccurate info, so please double check the response.{" "}
            <a href="#" className="text-gray-600 hover:underline">
              Your Privacy & Centra AI
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
