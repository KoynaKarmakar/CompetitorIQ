import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatUrl(url: string): string {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + "…";
}
