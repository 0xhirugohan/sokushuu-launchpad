import type React from "react";

interface ButtonProps {
    children: React.ReactNode;
    className?: string;
    type?: 'submit' | 'reset' | 'button';
    disabled?: boolean;

    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return <button
        className={`p-2 rounded-md border-2 border zinc-600 disabled:bg-zinc-300 cursor-pointer disabled:cursor-not-allowed ${className}`}
        {...props}
    >
        {children}
    </button>
};