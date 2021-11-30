export function parseJSON<T>(json: string): T {
    try {
        return JSON.parse(json) as T;
    } catch (e) {
        throw new Error(`Could not parse file, make sure it is a valid JSON file.\nDetails: ${(e as Error).message}`);
    }
}
