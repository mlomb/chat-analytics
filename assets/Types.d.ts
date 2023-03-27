declare module "*.png" {
    const value: any;
    export = value;
}
declare module "*.svg" {
    const value: any;
    export = value;
}
declare module "*.gif" {
    const value: any;
    export = value;
}
declare const env: {
    isProd: boolean;
    isDev: boolean;
    build: {
        commitHash: string;
        version: string;
        date: string;
    };
};
