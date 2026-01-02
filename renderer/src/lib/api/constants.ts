export const API_CONFIG = {
  DEV_URL: 'http://localhost:8000',
  PROD_URL: 'https://vyl7ozve5sbobqeg2hbiik3gzu0vqbio.lambda-url.us-east-1.on.aws',
  API_PREFIX: '/api/v1',

  TIMEOUTS: {
    DEFAULT: 10000,
    INTERACTION: 30000,
    SERVICE_STOP: 10000,
  },

  RETRY: {
    MAX_ATTEMPTS: 2,
    BACKOFF_MS: 1000,
  },
} as const;

export const ENDPOINTS = {
  STATUS: '/',

  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_GOOGLE_URL: '/auth/google/url',
  AUTH_GOOGLE_CALLBACK: '/auth/google/callback',
  AUTH_GITHUB_URL: '/auth/github/url',
  AUTH_GITHUB_EXCHANGE: '/auth/github/exchange',

  // Service
  SERVICE_CLIENTS: '/service/clients',
  SERVICE_CLIENT_BY_ID: '/service/clients/:clientId',
  SERVICE_CLIENT_RENAME: '/service/clients/:clientId/rename',
  SERVICE_NETWORK_ENABLE: '/service/network/enable',
  SERVICE_NETWORK_DISABLE: '/service/network/disable',

  // Interactions
  INTERACTIONS_REGISTER: '/interactions/register',
  INTERACTION_BY_ID: '/interactions/:interactionId',

  // Persons
  PERSON_BY_ID: '/persons/:personId',
  PERSONS_ALL: '/persons/all',
  PERSON_UPDATE: '/persons/:personId/update',

  // Conversations
  CONVERSATION_BY_ID: '/conversations/:conversationId',
} as const;