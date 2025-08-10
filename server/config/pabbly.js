require('dotenv').config();

module.exports = {
  apiKey: process.env.PABBLY_API_KEY,
  endpoint: process.env.PABBLY_API_ENDPOINT || 'https://api.pabbly.com/whatsapp/sendMessage',
}; 