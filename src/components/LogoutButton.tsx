
'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';


import { clearToken } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';

export default function LogoutButton() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout'); 
            
            dispatch(clearToken());
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
        >
            <LogOut size={16}/> Logout
        </button>
    );
}
