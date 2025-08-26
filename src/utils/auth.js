// Token management
export const setToken = (token) => {
    localStorage.setItem('authToken', token);
};

export const getToken = () => {
    return localStorage.getItem('authToken');
};

export const removeToken = () => {
    localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
    const token = getToken();
    return token !== null && token !== '';
};

// User data management
export const setUserData = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
    localStorage.removeItem('userData');
};

// Logout function
export const logout = () => {
    removeToken();
    removeUserData();
};