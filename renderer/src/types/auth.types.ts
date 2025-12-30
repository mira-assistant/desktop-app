export interface User {
    id: string;
    username: string;
    email: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: {
        id: string;
        username?: string | null;
        email: string;
        is_active: boolean;
    };
}