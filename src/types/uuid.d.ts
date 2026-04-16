declare module 'uuid' {
    export function v4(options?: any, buffer?: any, offset?: any): string;
    export function v1(options?: any, buffer?: any, offset?: any): string;
    export function v3(name: string | number[], namespace: string | number[], buffer?: any, offset?: any): string;
    export function v5(name: string | number[], namespace: string | number[], buffer?: any, offset?: any): string;
    export function validate(uuid: string): boolean;
    export function version(uuid: string): number;
    export function parse(uuid: string): Uint8Array;
    export function stringify(buffer: Uint8Array, offset?: number): string;
}
