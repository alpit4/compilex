import React from "react";

const AuthLayout = ({ children }) => {
    return (
        <div className="flex flex-col h-screen items-center justify-center">
            {children}
        </div>
    );
};

export default AuthLayout;