import Navbar from "@/modules/home/components/navbar";
import React from "react";
import { currentUserRole } from "@/modules/auth/actions";

const RootLayout = async ({ children }) => {
    const userRole = await currentUserRole();
    return(
        <main className="flex flex-col min-h-screen max-h-screen">
            <Navbar userRole={userRole} />
            <div className="flex-1 flex flex-col px-4 pb-4">
                <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]" />
                {children}
            </div>
        </main>
    )
};

export default RootLayout;