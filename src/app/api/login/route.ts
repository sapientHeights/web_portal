import { NextResponse, NextRequest } from "next/server";

export const config = {
    api: {
        bodyParser: false
    }
}

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL;

    const { email, password, rememberMe } = await request.json();
    try {
        const res = await fetch(`${backendUrl}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                pass: password,
                rememberMe
            }),
        });

        const data = await res.json();

        if (!data.error && data.token) {
            const res = NextResponse.json({ success: true });
            const maxAge = rememberMe ? 60 * 60 * 24 : 60 * 60;

            res.cookies.set('auth_token', data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: maxAge,
            });
            res.cookies.set('user', email, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: maxAge,
            });

            return res;
        }

        return NextResponse.json({ success: false, message: data.message || 'Login Failed' }, { status: 401 });
    }
    catch(err){
        return NextResponse.json({ success: false, message: 'Something went wrong', err }, { status: 500 });
    }
}