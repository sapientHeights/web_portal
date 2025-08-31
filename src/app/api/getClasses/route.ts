import { NextResponse } from "next/server";

export async function GET() {
    const backendUrl = process.env.BACKEND_URL;

    try {
        const res = await fetch(`${backendUrl}/getClasses.php`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();

        if (!data.error) {
            const res = NextResponse.json({ success: true, classesData: data.classesData });
            return res;
        }

        return NextResponse.json({ success: false, message: data.message || 'Data not available' }, { status: 401 });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: 'Something went wrong', err }, { status: 500 });
    }
}