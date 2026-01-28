import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const applicationData = await request.json();
        console.log('API received applicationData:', JSON.stringify(applicationData, null, 2)); // ?îÎ≤ÑÍπ?

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

        console.log('API received checklistDetails:', JSON.stringify(checklistDetails, null, 2)); // ?îÎ≤ÑÍπ?

        // checklistDetailsÍ∞Ä ?àÏúºÎ©?Í∑∏Î?Î°??¨Ïö©, ?ÜÏúºÎ©?Í∏∞Ï°¥ Î∞©Ïãù?ºÎ°ú Î≥Ä??
        let finalChecklistDetails = checklistDetails;
        
        if (!checklistDetails) {
            // Í∏∞Ï°¥ ?∏Ìôò?? checkedItems Î∞∞Ïó¥??Í∞ùÏ≤¥Î°?Î≥Ä??
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
            checklistDetails: finalChecklistDetails, // Ï≤¥ÌÅ¨Î¶¨Ïä§???ÅÏÑ∏ ?ïÎ≥¥ ?Ä??
            checkedItems: Array.isArray(checkedItems) ? checkedItems : [], // Í∏∞Ï°¥ ?∏Ìôò???†Ï?
            comments: typeof comments === 'object' ? JSON.stringify(comments) : comments,
            aiSummary: aiSummary || "", // AI ?îÏïΩ ?Ä??
            appliedAt: new Date().toISOString(),
            appliedDate: new Date().toISOString(),
            status: "Í≤Ä??Ï§?,
        });

        console.log('Saved to DB with checklistDetails:', JSON.stringify(finalChecklistDetails, null, 2)); // ?îÎ≤ÑÍπ?

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("Error saving application:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save application" },
            { status: 500 }
        );
    }
}
