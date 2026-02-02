// Enhanced Toast Component with Animations
'use client';

import { toast as sonnerToast, ExternalToast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import React from 'react';

// Toast icons with animations - using functional components to avoid JSX type issues
const SuccessIcon = () => <CheckCircle2 className="h-5 w-5 animate-scale-in" />;
const ErrorIcon = () => <XCircle className="h-5 w-5 animate-scale-in" />;
const WarningIcon = () => <AlertCircle className="h-5 w-5 animate-bounce-subtle" />;
const InfoIcon = () => <Info className="h-5 w-5 animate-scale-in" />;
const LoadingIcon = () => <Loader2 className="h-5 w-5 animate-spin" />;

// Enhanced toast with custom styling and animations
export const toast = {
    success: (message: string, options?: ExternalToast) => {
        return sonnerToast.success(message, {
            icon: React.createElement(SuccessIcon),
            className: 'group toast-success',
            duration: 3000,
            ...options,
        });
    },

    error: (message: string, options?: ExternalToast) => {
        return sonnerToast.error(message, {
            icon: React.createElement(ErrorIcon),
            className: 'group toast-error',
            duration: 4000,
            ...options,
        });
    },

    warning: (message: string, options?: ExternalToast) => {
        return sonnerToast.warning(message, {
            icon: React.createElement(WarningIcon),
            className: 'group toast-warning',
            duration: 3500,
            ...options,
        });
    },

    info: (message: string, options?: ExternalToast) => {
        return sonnerToast.info(message, {
            icon: React.createElement(InfoIcon),
            className: 'group toast-info',
            duration: 3000,
            ...options,
        });
    },

    loading: (message: string, options?: ExternalToast) => {
        return sonnerToast.loading(message, {
            icon: React.createElement(LoadingIcon),
            className: 'group toast-loading',
            ...options,
        });
    },

    promise: <T,>(
        promise: Promise<T>,
        {
            loading: loadingMessage,
            success: successMessage,
            error: errorMessage,
        }: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        },
        options?: ExternalToast
    ) => {
        return sonnerToast.promise(promise, {
            loading: loadingMessage,
            success: successMessage,
            error: errorMessage,
            ...options,
        });
    },
};

// Optimistic UI helper
export function optimisticUpdate<T>(
    optimisticData: T,
    updateFn: () => Promise<T>,
    {
        onSuccess,
        onError,
        successMessage,
        errorMessage,
    }: {
        onSuccess?: (data: T) => void;
        onError?: (error: any) => void;
        successMessage?: string;
        errorMessage?: string;
    }
) {
    return {
        optimisticData,
        execute: async () => {
            try {
                const result = await updateFn();
                if (successMessage) {
                    toast.success(successMessage);
                }
                onSuccess?.(result);
                return result;
            } catch (error) {
                if (errorMessage) {
                    toast.error(errorMessage);
                }
                onError?.(error);
                throw error;
            }
        },
    };
}
