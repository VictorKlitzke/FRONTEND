import { AuthStore } from "../feature/auth/stores/auth-store";

export const getToken = () => {
    return AuthStore.getState().token;
};

export const getUser = () => {
    return AuthStore.getState().user;
};

export const logout = () => {
    AuthStore.getState().logout();
};
