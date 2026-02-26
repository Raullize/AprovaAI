import { useEffect } from 'react';

/**
 * Sets the browser tab title.
 * Format: "Page Name | AprovaAI"
 * Pass null to use just "AprovaAI".
 */
export function usePageTitle(title: string | null) {
    useEffect(() => {
        document.title = title ? `${title} | AprovaAI` : 'AprovaAI';
        return () => {
            document.title = 'AprovaAI';
        };
    }, [title]);
}
