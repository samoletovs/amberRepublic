const { app } = require('@azure/functions');
const { getAvailableModels } = require('../llm.js');

app.http('models', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    const models = getAvailableModels();
    return { jsonBody: { models, available: models.length > 0 } };
  },
});
