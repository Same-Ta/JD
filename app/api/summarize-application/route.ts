import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try {
        const { checklistDetails, seekerName } = await request.json();

        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: "API key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 체크리스트 내용을 텍스트로 변환
        const checklistText = Object.entries(checklistDetails)
            .map(([_, item]: [string, any]) => {
                return `
항목: ${item.title}
설명: ${item.description}
보유 여부: ${item.checked ? '보유' : '미보유'}
경험 상세:
${item.comment || '작성 내용 없음'}
-------------------`;
            })
            .join('\n\n');

        const prompt = `
다음은 ${seekerName}님의 채용 지원서 내용입니다. 
이 지원자의 경험과 역량을 간결하고 전문적으로 요약해주세요.

${checklistText}

요약 형식:
1. 핵심 역량 및 강점 (2-3줄)
2. 주요 경험 요약 (3-4개 항목, 각 1-2줄)
3. 종합 평가 (2-3줄)

요약 내용은 채용 담당자가 빠르게 지원자를 파악할 수 있도록 핵심만 간결하게 작성해주세요.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        return NextResponse.json({ 
            success: true, 
            summary: summary 
        });

    } catch (error) {
        console.error("Error generating summary:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate summary" },
            { status: 500 }
        );
    }
}
