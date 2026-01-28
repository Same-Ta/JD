import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function POST(request: NextRequest) {
    try {
        const q = collection(db, "applications");
        const querySnapshot = await getDocs(q);
        
        let count = 0;
        const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
            await updateDoc(doc(db, "applications", docSnapshot.id), {
                aiSummary: ""
            });
            count++;
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ 
            success: true, 
            message: `${count}개의 AI 요약이 초기화되었습니다.`,
            count: count
        });

    } catch (error) {
        console.error("AI 요약 초기화 실패:", error);
        return NextResponse.json(
            { success: false, error: "AI 요약 초기화에 실패했습니다." },
            { status: 500 }
        );
    }
}
