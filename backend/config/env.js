const path = require('path');
const dotenv = require('dotenv');

// Always load backend/.env, no matter which folder the process was started from
dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });
