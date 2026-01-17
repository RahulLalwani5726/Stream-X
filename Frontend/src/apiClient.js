/**
 * Global API Client
 * Automatically attaches 'Authorization' header if a token exists in LocalStorage.
 * Also handles Credentials (Cookies) as a fallback.
 */
const fetchData = async (TYPE = "GET", URL, DATA = {}) => {
    const isBodyRequired = ['POST', 'PUT', 'PATCH'].includes(TYPE.toUpperCase());
    
    let config = {
        method: TYPE.toUpperCase(),
        headers: {},
        credentials: "include", // Keep this for when cookies eventually work
    };

    // --- THE FIX: Attach Token from LocalStorage ---
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    // -----------------------------------------------

    const isFormData = DATA instanceof FormData;

    if (isBodyRequired) {
        if (isFormData) {
            config.body = DATA; 
        } else {
            config.headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(DATA);
        }
    }

    try {
        const response = await fetch(URL, config); 
        
        if (!response.ok) {
            // If token is expired (401), clear storage so user knows they are logged out
            if (response.status === 401) {
                localStorage.removeItem("accessToken"); 
                localStorage.removeItem("refreshToken");
                throw new Error("UNAUTHORIZED");
            }
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorBody || response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
             throw new Error("Failed to connect to the backend server.");
        }
        throw e;
    }
};

export default fetchData;