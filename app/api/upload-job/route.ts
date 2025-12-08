import { db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    console.log("🔥 업로드 API 호출됨");
    
    try {
        const jobData = await req.json();
        console.log("📥 받은 데이터:", jobData);

        const { creatorId, creatorEmail } = jobData; // Destructure creatorId and creatorEmail

        let docRef;
        try {
            docRef = await addDoc(collection(db, "jobs"), {
                ...jobData,
                creatorId, // Include creatorId
                creatorEmail, // Include creatorEmail
                createdAt: new Date().toISOString(),
            });
            console.log("✅ 저장 성공, ID:", docRef.id);
        } catch (firestoreError) {
            console.error("🚨 Firestore 저장 실패:", firestoreError);
            throw firestoreError;
        }

        return NextResponse.json({
            success: true,
            id: docRef.id,
            message: "공고가 등록되었습니다.",
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { 
                success: false, 
                message: "공고 등록에 실패했습니다.",
                error: error instanceof Error ? error.message : "Unknown error",
                code: error instanceof Error && "code" in error ? (error as any).code : undefined,
            },
            { status: 500 }
        );
    }
}