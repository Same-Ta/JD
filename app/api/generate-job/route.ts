import { NextResponse } from "next/server";

// ------------------------------------------------------------------
// 1. WINNOW v2 시스템 프롬프트 (그대로 유지)
// ------------------------------------------------------------------
const WINNOW_INSTRUCTIONS = `
AI 기반 JD Collaborative Builder — 시스템 지침서 v2 (GEMS용)

0. 역할 정의
너는 "AI 기반 JD Collaborative Builder", WINNOW이다.

[핵심 목표]
사용자와의 대화를 통해 정보를 수집하고, 이를 구조화된 "체크리스트"와 "JD(직무기술서)"로 변환한다.

[대화 원칙]
- 한 번에 2~3개 이하의 질문만 한다.
- 사용자가 답변하면 "제가 이해한 바로는..." 하고 요약 후 다음 질문을 한다.
- 각 단계가 끝날 때마다 "다음 단계로 넘어갈까요?"라고 묻는다.
`;

const SYSTEM_PROMPT = `
${WINNOW_INSTRUCTIONS}

=====================================================================
[절대 규칙 - 출력 포맷]
너는 **반드시** 아래 JSON 형식으로만 응답해야 한다. 
마크다운 코드 블럭(\`\`\`json)을 쓰지 말고, 순수한 JSON 텍스트만 출력해라.
설명이나 잡담은 'aiResponse' 필드에 넣고, JSON 바깥에 아무것도 쓰지 마라.

{
  "title": "현재 파악된 직무 제목 (없으면 '미정')",
  "progress": "현재 진행 단계 (1단계/2단계/3단계)",
  "checklist": [
    { 
      "category": "분류 (예: 필수 역량, 우대 사항, 주요 업무, 복리후생)", 
      "content": "구체적인 항목 내용" 
    }
  ],
  "aiResponse": "사용자에게 건네는 말 (줄바꿈 문자 \\n 사용)"
}

[주의사항]
1. 'checklist' 배열은 대화가 진행됨에 따라 **누적해서 업데이트**해라.
=====================================================================
`;

export async function POST(req: Request) {
  // 1. API 키 확인
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ API Key Missing");
    return NextResponse.json({ error: "API Key is not configured" }, { status: 500 });
  }

  try {
    // 2. 요청 파싱
    const body = await req.json();
    const { messages, userMsg } = body;

    // 3. 프롬프트 구성
    const historyParts = Array.isArray(messages)
      ? messages.map((msg: any) => {
          const role = msg.role === "user" || msg.sender === "user" ? "USER" : "MODEL";
          const text = msg.content || msg.text || msg.message || "";
          return `${role}: ${text}`;
        }).join("\n\n")
      : "";

    const finalPrompt = `
${SYSTEM_PROMPT}

[이전 대화 내역]
${historyParts}

[사용자 입력]
USER: ${userMsg}

[AI 응답 (JSON)]
MODEL:
`;

    console.log("▶️ Sending request via Direct Fetch (gemini-pro)...");

    // 4. ★ SDK 대신 fetch로 직접 호출 (Hoppscotch 방식) ★
    // 모델명: gemini-pro (성공했던 모델)
    // gemini-pro -> gemini-1.5-flash 로 변경
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 5. 응답 데이터 추출
    // 구조: candidates[0].content.parts[0].text
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    console.log("📥 Raw Response:", responseText);

    // 6. JSON 정제 및 파싱
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
      
      // 안전장치: 필수 필드 기본값
      if (!jsonResponse.aiResponse) jsonResponse.aiResponse = "응답 처리 중입니다.";
      if (!jsonResponse.checklist) jsonResponse.checklist = [];
      
    } catch (parseError) {
      console.error("❌ JSON Parsing Failed:", responseText);
      jsonResponse = {
        title: "직무 정의 중",
        progress: "1단계",
        checklist: [],
        aiResponse: responseText // 파싱 실패 시 원본 텍스트 표시
      };
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}