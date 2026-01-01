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
    ENABLE_SERVICE: '/service/network/enable',
    DISABLE_SERVICE: '/service/network/disable',

    // Interactions
    REGISTER_INTERACTION: '/interactions/register',
    GET_INTERACTION: '/interactions/:interactionId',
    DELETE_INTERACTION: '/interactions/:interactionId',
    INTERACTION_INFERENCE: '/interactions/:interactionId/inference',

    // Persons
    GET_PERSON: '/persons/:personId',
    GET_ALL_PERSONS: '/persons/all',
    UPDATE_PERSON: '/persons/:personId/update',

    // Conversations
    GET_CONVERSATION: '/conversations/:conversationId',
  } as const;