import { getToken } from './auth/authUtils';

const API_URL = 'https://landsatdata.earth/api/v1'; 


const apiClient = async (endpoint, method = 'GET', data = null, queryParams = '') => {
  const token = getToken();

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token.access}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}/${queryParams}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

export default apiClient;