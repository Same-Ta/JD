import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const applicationData = await request.json();
        console.log('API received applicationData:', JSON.stringify(applicationData, null, 2)); // 디버깅

        const { 
            seekerId, 
            seekerEmail, 
            seekerName,
            jobId,
            jobTitle,
            jobCreatorId, 
            team,
            checkedItems,
            comments,
            checklistDetails,
            aiSummary 
        } = applicationData;

        console.log('API received checklistDetails:', JSON.stringify(checklistDetails, null, 2)); // 디버깅

        // checklistDetails가 있으면 그대로 사용, 없으면 기존 방식으로 변환
        let finalChecklistDetails = checklistDetails;
        
        if (!checklistDetails) {
            // 기존 호환성: checkedItems 배열을 객체로 변환
            const checkedItemsObject: Record<string, boolean> = {};
            if (Array.isArray(checkedItems)) {
                checkedItems.forEach((item: string) => {
                    checkedItemsObject[item] = true;
                });
            }
            finalChecklistDetails = checkedItemsObject;
        }

        const docRef = await addDoc(collection(db, "applications"), {
            seekerId,
            seekerEmail,
            seekerName: seekerName || "",
            jobId,
            jobTitle,
            jobCreatorId,
            teamName: team || "",
            checklistDetails: finalChecklistDetails, // 체크리스트 상세 정보 저장
            checkedItems: Array.isArray(checkedItems) ? checkedItems : [], // 기존 호환성 유지
            comments: typeof comments === 'object' ? JSON.stringify(comments) : comments,
            aiSummary: aiSummary || "", // AI 요약 저장
            appliedAt: new Date().toISOString(),
            appliedDate: new Date().toISOString(),
            status: "검토 중",
        });

        console.log('Saved to DB with checklistDetails:', JSON.stringify(finalChecklistDetails, null, 2)); // 디버깅

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("Error saving application:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save application" },
            { status: 500 }
        );
    }
}