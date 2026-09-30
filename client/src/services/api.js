import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.authorization = `Bearer ${token}`;
  return req;
});

export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const createElection = (data) => API.post('/admin/election', data);
export const getResults = () => API.get('/admin/results');
export const getRegionalElections = () => API.get('/voter/elections');
export const castVote = (data) => API.post('/voter/vote', data);