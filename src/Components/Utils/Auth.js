import Cookies from "js-cookie";

export const isAuthenticated = () => {
    const token = Cookies.get("access_token");
    return !!token;
};
