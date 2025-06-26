"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
 import {clearToken, } from '../redux/slices/authSlice'; 

// --- UI & Icons ---
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { RootState } from '@/redux/store';
import axios from 'axios';
import toast from 'react-hot-toast';

  

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const handleLogout = async() => {
        try{
          await axios.post('/api/logout');
           toast.success('Logged out successfully!');
          dispatch(clearToken());
          console.log("Logging out...");
          router.push('/'); 
        }
        catch(e){
            toast.error("Problem in logging out")
        }
        
  };

  const handleGoToTasks = () => {
    console.log("Navigating to tasks...");
    router.push('/'); 
  };

  if(!isAuthenticated){
    return (
      <div></div>
    )
  }
  else
  return (
    
<header className="sticky top-0 z-50 w-full border-b  bg-gray-100 text-white">   
   <div className="container flex h-16 items-center justify-between px-11 ">
        
        {/* App Name/Logo on the left */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-foreground">
          TODO APP
        </Link>

        {/* Avatar with Dropdown on the right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 text-white cursor-pointer">
                
                <AvatarImage  />
                <AvatarFallback className='bg-blue-500'>U</AvatarFallback> {/* Fallback with user initial */}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* --- Tasks Button --- */}
            {/* <DropdownMenuItem onClick={handleGoToTasks} className="cursor-pointer">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              <span>Tasks</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator /> */}
            
            {/* --- Logout Button --- */}
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}