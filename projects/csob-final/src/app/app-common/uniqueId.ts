let id: number = 0;
export function uniqueId(prefix: string): string {
    return prefix + (++id);
}