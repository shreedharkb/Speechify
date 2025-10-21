export const getAuthToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        return null;
    }
    
    try {
        // Verify the user object can be parsed
        JSON.parse(user);
        return token;
    } catch (e) {
        // If user data is corrupted, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
    }
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
};

export const handleAuthError = (error) => {
    if (error.status === 401) {
        // Token is invalid or expired
        clearAuth();
    }
    return error;
};