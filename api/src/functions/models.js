import { app } from '@azure/functions';
import { getAvailableModels } from '../llm.js';

app.http('models', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    const models = getAvailableModels();
    return { jsonBody: { models, available: models.length > 0 } };
  },
});
