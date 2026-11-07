export interface User {
    id: string;
    avatar?: string;
    email?: string;
    name?: string;
    surname?: string;
    phone?: string;
    password?: string;
    googleId?: string;
    facebookId?: string;
    address?: string;
    preferredLanguage?: string;
    status?: string;
    registeredAt?: Date;
    isAcceptedTOS?: boolean;
    isAcceptedKVKK?: boolean;
    lastSmsSent?: Date;
    maritalStatus?: string;
    militaryStatus?: string;
    gender?: "male" | "female";
    identificationNumber?: string;
    isPersonaltyTest?: boolean;
    [key: string]: any;
}

export interface RegisterPayload {
    name: string;
    surname: string;
    email: string;
    phone: string;
    password: string;
    isAcceptedTOS: boolean;
    isAcceptedKVKK: boolean;
    authCode?: string; // authCode ekleniyor
    redirectUri?: string; // redirectUri ekleniyor
}
export interface LinkedInRegisterPayload {
    authCode?: string;
    redirectUri?: string;
}
export interface CreateProfilePayload {
    token: string;
    password: string;
    name: string;
    surname: string;
}
