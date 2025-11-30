import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
    return (
        <div className={`rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl ${className}`}>
            {title && <h3 className="mb-4 text-xl font-bold text-gray-800">{title}</h3>}
            {children}
        </div>
    );
}
