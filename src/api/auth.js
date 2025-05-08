import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/register`, { name, email, password });
  return response.data;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await axios.post(`${API_URL}/users/${userId}/change-password`, {
    currentPassword,
    newPassword
  });
  return response.data;
};


