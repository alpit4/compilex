import { Button } from "@/components/ui/button";
import { currentUserRole } from "@/modules/auth/actions";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { ArrowLeft} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/dist/server/api-utils";
import React from "react";
import CreateProblemForm from "@/modules/problems/components/create-problem-form";
import { ModeToggle } from "@/components/ui/mode-toggle";

const CreateProblemPage = async () => {
    const user = await currentUser();
    const userRole = await currentUserRole();

    if(userRole !== UserRole.ADMIN){
        return redirect("/");
    }

    return (
        <section className="flex flex-col items-center justify-center container mx-4 my-4">
            <div className="flex flex-row justify-between items-center w-full">
                <Link href={"/"}>
                   <Button variant={"outline"} size={"icon"}>
                    <ArrowLeft className="size-4" />
                   </Button>
                </Link>
                <h1 className="text-3xl font-bold text-indigo-300">Welcome {user?.firstName}! Create a Problem</h1>
                <ModeToggle />
            </div>
            <CreateProblemForm />
        </section>
    )
}

export default CreateProblemPage; 