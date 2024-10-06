export const getToken = () => {
    return JSON.parse(localStorage.getItem('token'));
  };
  
  export const setToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  export const removeToken = () => {
    localStorage.removeItem('token');
  };