import { NextRequest, NextResponse } from "next/server";

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
당신은 엄격하고 냉철한 전문 인사담당자입니다. 다음 ${seekerName}님의 채용 지원서를 객관적으로 분석하여 채용 적합성을 평가해주세요.

${checklistText}

【평가 기준】
- 각 항목에 대한 경험 설명이 구체적이고 관련성이 있는지 확인
- 단순히 "보유"라고만 체크하고 구체적 경험이 없으면 감점
- 관련 없는 내용이나 형식적인 답변은 엄격히 평가
- 경험의 깊이와 실질성을 중점적으로 평가

다음 형식으로 평가해주세요:

【적합도 평가】
종합 점수: [1-5점 중] (점수 기준: 1점-매우 부족, 2점-부족, 3점-보통, 4점-우수, 5점-매우 우수)
추천 여부: [적극 추천 / 추천 / 보통 / 재검토 필요 / 부적합] 중 하나 선택

【강점 분석】
(실제로 강점이 있을 경우에만 작성. 없으면 "특별한 강점을 발견하기 어려움"이라고 명시)
- 강점 1: (구체적으로)
- 강점 2: (구체적으로)
- 강점 3: (구체적으로)

【문제점 및 부족한 부분】
(반드시 구체적으로 지적)
- 문제점 1: (어떤 항목에서 어떤 부분이 부족한지 명확히)
- 문제점 2: (관련성 없는 답변이나 형식적 답변 지적)
- 문제점 3: (추가 보완 필요 사항)

【주요 경험 분석】
(각 경험에 대해 관련성과 구체성을 평가)
1. [항목명]: (경험 내용 요약) - 평가: [우수/보통/부족/관련성 없음]
2. [항목명]: (경험 내용 요약) - 평가: [우수/보통/부족/관련성 없음]
3. [항목명]: (경험 내용 요약) - 평가: [우수/보통/부족/관련성 없음]

【종합 의견】
(냉철하게 평가. 부적합하면 명확히 부적합 사유를 명시. 보완이 필요한 부분을 구체적으로 지적)

주의사항:
- 과장하지 말고 사실에 근거하여 평가
- 애매한 표현 지양, 명확한 평가 제시
- 관련 없는 내용은 반드시 지적
- 점수는 엄격한 기준 적용 (3점 이상은 실제로 우수한 경우에만 부여)
`;


        // Gemini API 직접 호출 (REST API)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Gemini API error:", errorData);
            throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "요약 생성 실패";

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
