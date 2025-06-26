// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // Your global Tailwind CSS file
import { Providers } from "@/redux/provider"; 
import { Toaster } from "react-hot-toast";
import PersistProvider from "@/redux/PersistProvider";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
// Removed: import { cookies } from "next/headers"; // No longer needed for token check in layout

export const metadata: Metadata = {
  title: "Todo App",
  description: "A professional To-Do app",
};

export default function RootLayout({ // Changed to non-async since no cookie reading here
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Removed: const token = cookies().get("token")?.value;
  // Removed: console.log("Token in RootLayout:", token ? "Exists" : "Does not exist");

  return (
    <html lang="en">
      {/* Apply min-h-screen to the body for full viewport height
          and set a consistent light background color.
          Use flex flex-col to stack Navbar and the main content area below it.
      */}
      <body className="min-h-screen bg-white text-gray-900 flex flex-col">
        {/* The StoreProvider wraps everything to provide Redux state */}
        <Providers>
          <PersistProvider>
            {/* The Toaster handles all app notifications */}
            <Toaster position="top-center" reverseOrder={false} />

            {/* Navbar is ALWAYS rendered */}
            <Navbar />

            {/* Main content area: Sidebar + Children
                This div will now flex-grow to take all remaining vertical space.
                It itself is a flex container for the Sidebar and the children,
                arranged in a row.
            */}
            <div className="flex flex-grow w-full">
              {/* Sidebar is ALWAYS rendered */}
              <Sidebar />
              
              {/* Main content area for pages, takes up remaining width, and is scrollable */}
              <main className="flex-grow p-4 overflow-auto bg-white">
                {children} 
              </main>
            </div>
          </PersistProvider>
        </Providers>
      </body>
    </html>
  );
}
