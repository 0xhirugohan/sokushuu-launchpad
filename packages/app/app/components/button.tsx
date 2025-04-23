import type React from "react";

interface ButtonProps {
    children: React.ReactNode;
    disabled?: boolean;

    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return <button
        className="p-2 rounded-md border-2 border zinc-600 cursor-pointer"
        {...props}
    >
        {children}
    </button>
};