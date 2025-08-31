import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const backendUrl = process.env.BACKEND_URL;

    const cookieStore = await cookies();
    const user = cookieStore.get('user')?.value;
    const email = decodeURIComponent(user ?? '');

    try {
        const res = await fetch(`${backendUrl}/getUser.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!data.error) {
            const res = NextResponse.json({ success: true, user: data.userData });
            return res;
        }

        return NextResponse.json({ success: false, message: data.message || 'User not found' }, { status: 401 });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: 'Something went wrong', err }, { status: 500 });
    }
}