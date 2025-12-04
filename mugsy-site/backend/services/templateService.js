import MessageTemplate from '../models/MessageTemplate.js';
import defaultMessageTemplates from '../data/defaultMessageTemplates.js';

const tokenRegex = /\{\{(\w+)\}\}/g;

export const ensureDefaultTemplates = async () => {
  await Promise.all(
    defaultMessageTemplates.map(async (template) => {
      const existing = await MessageTemplate.findOne({ key: template.key });
      if (!existing) {
        await MessageTemplate.create(template);
      }
    })
  );
};

export const resetTemplates = async (keys) => {
  const targets = keys && keys.length > 0
    ? defaultMessageTemplates.filter((template) => keys.includes(template.key))
    : defaultMessageTemplates;

  await Promise.all(
    targets.map(async (template) => {
      await MessageTemplate.findOneAndUpdate(
        { key: template.key },
        {
          ...template,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    })
  );

  return MessageTemplate.find(keys && keys.length ? { key: { $in: keys } } : {});
};

export const getTemplateByKey = async (key) => {
  let template = await MessageTemplate.findOne({ key });
  if (!template) {
    const fallback = defaultMessageTemplates.find((entry) => entry.key === key);
    if (fallback) {
      template = await MessageTemplate.create(fallback);
    }
  }
  return template;
};

const compileString = (templateString = '', data = {}) => templateString.replace(tokenRegex, (_, token) => {
  const value = data[token];
  return value === undefined || value === null ? '' : String(value);
});

export const renderTemplate = async (key, data = {}) => {
  const template = await getTemplateByKey(key);
  if (!template) {
    return {
      key,
      title: '',
      body: '',
      signature: ''
    };
  }

  return {
    key: template.key,
    channel: template.channel,
    title: compileString(template.title, data),
    body: compileString(template.body, data),
    signature: compileString(template.signature, data),
    status: template.status,
    version: template.version
  };
};

export const publishTemplate = async (key) => {
  const template = await MessageTemplate.findOneAndUpdate(
    { key },
    {
      status: 'published',
      $inc: { version: 1 },
      lastUpdated: new Date()
    },
    { new: true }
  );
  return template;
};

export default {
  ensureDefaultTemplates,
  resetTemplates,
  getTemplateByKey,
  renderTemplate,
  publishTemplate
};
