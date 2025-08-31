'use client';

import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type UserData = {
    email: string;
    name: string;
    role: string;
    desc: string;
    firstLogin: number;
}

type UserContextType = {
    user: UserData | null;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children, user: initialUser }: { children: React.ReactNode; user: UserData }) => {
    const [user, setUser] = useState<UserData | null>(initialUser);
    const router = useRouter();

    const refreshUser = async() => {
        try{
            const res = await fetch('/api/getUser');
            const data = await res.json();

            if(data.success && data.user){
                setUser(data.user);
            }
            else{
                setUser(null);
                toast.error("Please log in again.");
                router.push('/login');
            }
        }
        catch(e){
            setUser(null);
            toast.error("Please log in again.");
            router.push('/login');
            console.error(e);
        }
    }

    return (
        <UserContext.Provider value={{user, refreshUser}}>
            {children}
        </UserContext.Provider>
    )
};

export const useUser = () => {
    const context = useContext(UserContext);
    if(!context){
        throw new Error("Error");
    }
    return context;
}