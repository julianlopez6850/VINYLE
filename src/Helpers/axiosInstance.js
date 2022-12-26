import axios from 'axios';

export const instance = axios.create({ withCredentials: true, });

export const loginInstance = axios.create({ withCredentials: true, timeout: 500});