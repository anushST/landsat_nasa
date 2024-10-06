import apiClient from "../apiClient";

export const signup = async (email, password, nickname) => {

  const data = await apiClient('/auth/signup', 'POST', {
    email,
    username: nickname,
    password,
  });

  // Store the token after signup
  localStorage.setItem('token', JSON.stringify(data));

  return data;
};

export const login = async (email, password) => {

  const data = await apiClient('/auth/login', 'POST', {
    username_or_email: email,
    password,
  });

  // Store the token after signup
  localStorage.setItem('token', JSON.stringify(data));

  return data;
};