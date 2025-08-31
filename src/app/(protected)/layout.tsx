import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserProvider } from "@/context/UserContext";

export default async function ProtectedLayout({ children } : { children: React.ReactNode} ){
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if(!token){
        redirect('/login');
    }

    const backendUrl = process.env.BACKEND_URL;
    const user = cookieStore.get('user')?.value;
    const email = decodeURIComponent(user ?? '');

    try {
        const res = await fetch(`${backendUrl}/getUser.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
            cache: 'no-store'
        });

        const data = await res.json();
        if (data.error || !data.userData){
            redirect('/login');
        }

        const user = data.userData;
        return (
            <UserProvider user={user}>
                {children}
            </UserProvider>
        )
    }
    catch(err){
        console.error(err);
        redirect('/login');
    }
}