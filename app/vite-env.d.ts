interface ImportMetaEnv {
    readonly isProd: boolean;
    readonly isDev: boolean;
    readonly isSelfHosted: boolean;
    readonly build: {
        commitHash: string;
        version: string;
        date: string;
    };
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
