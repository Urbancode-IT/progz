const axios = require('axios');
//zen api client
const apiClient = axios.create({
  baseURL: 'https://api.zen-urbancode.in',
  headers: {
    'x-api-key': process.env.API_KEY
  }
});

module.exports = apiClient;
