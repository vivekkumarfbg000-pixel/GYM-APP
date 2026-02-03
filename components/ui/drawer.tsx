'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const DrawerContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);

export const Drawer = ({
    children,
    open,
    onOpenChange
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void
}) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const show = isControlled ? open : internalOpen;
    const handleOpenChange = onOpenChange || setInternalOpen;

    if (!show) return null;

    return (
        <DrawerContext.Provider value={{ open: show, onOpenChange: handleOpenChange }}>
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div
                    className="bg-transparent w-full h-full absolute inset-0"
                    onClick={() => handleOpenChange(false)}
                />
                {children}
            </div>
        </DrawerContext.Provider>
    );
};

export const DrawerContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-white z-50 w-full max-w-md mx-auto rounded-t-[2rem] shadow-2xl relative animate-in slide-in-from-bottom duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
        {...props}
    />
);
DrawerHeader.displayName = "DrawerHeader";

export const DrawerTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DrawerTitle.displayName = "DrawerTitle";

export const DrawerTrigger = ({ children, onClick }: any) => {
    return <div onClick={onClick}>{children}</div>
}
