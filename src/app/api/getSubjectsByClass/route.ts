import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL;

    const {classId} = await request.json();
    try {
        const res = await fetch(`${backendUrl}/getSubjectsByClass.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                classId
            })
        });

        const data = await res.json();

        if (!data.error) {
            const res = NextResponse.json({ success: true, subjectsData: data.subjectsData });
            return res;
        }

        return NextResponse.json({ success: false, message: data.message || 'Data not available' }, { status: 401 });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: 'Something went wrong', err }, { status: 500 });
    }
}