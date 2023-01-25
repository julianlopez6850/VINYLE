import axios from 'axios';

export const instance = axios.create({ withCredentials: true, });

export const authInstance = axios.create({ withCredentials: true, timeout: 500});