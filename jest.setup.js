require('dotenv').config();

// Set up test environment variables
process.env.GITLAB_TOKEN = 'test-token';
process.env.GITLAB_API_URL = 'https://test-gitlab.com';