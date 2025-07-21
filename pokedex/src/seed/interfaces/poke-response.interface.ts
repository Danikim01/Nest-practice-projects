export interface PokeResponse {
    count: number;
    next: string;
    previous: string;
    results: PokeResult[];
}

export interface PokeResult {
    name: string;
    url: string;
}