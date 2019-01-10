export interface ConfigData {
    email: {
        server: string;
        username: string;
        password: string;
    },
    security: {
        on: number;
        off: number;
    }
}

export const Arguments: any = {
    emailPassword: null,
}