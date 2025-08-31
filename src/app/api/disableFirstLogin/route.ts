import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL;

    const { email } = await request.json();
    try {
        const res = await fetch(`${backendUrl}/disableFirstLogin.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email
            }),
        });

        const data = await res.json();

        if (!data.error) {
            const res = NextResponse.json({ success: true });
            return res;
        }

        return NextResponse.json({ success: false, message: data.message || 'Failed to disable first login' }, { status: 401 });
    }
    catch(err){
        return NextResponse.json({ success: false, message: 'Something went wrong', err }, { status: 500 });
    }
}