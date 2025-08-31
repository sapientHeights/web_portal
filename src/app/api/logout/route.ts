import { NextResponse } from "next/server";

export async function POST(){
    const response = NextResponse.json({ success: true });

    response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    });

    response.cookies.set('user', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    });

    return response;
}