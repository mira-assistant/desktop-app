export const API_CONFIG = {
    DEV_URL: 'http://localhost:8000',
    PROD_URL: 'https://vyl7ozve5sbobqeg2hbiik3gzu0vqbio.lambda-url.us-east-1.on.aws',
    API_PREFIX: '/api/v2',

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

    // Service
    REGISTER_CLIENT: '/service/client/register/:clientId',
    DEREGISTER_CLIENT: '/service/client/deregister/:clientId',
    ENABLE_SERVICE: '/service/enable',
    DISABLE_SERVICE: '/service/disable',

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