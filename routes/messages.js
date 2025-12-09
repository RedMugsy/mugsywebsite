import express from 'express';
import MessageTemplate from '../models/MessageTemplate.js';
import {
  authenticateToken,
  authorize
} from '../middleware/auth.js';
import {
  validate
} from '../middleware/validation.js';
import {
  messageTemplateBulkSchema,
  messageTemplateResetSchema,
  messageTemplatePublishSchema
} from '../middleware/validation.js';
import {
  resetTemplates,
  ensureDefaultTemplates
} from '../services/templateService.js';

const router = express.Router();

// Ensure defaults exist before handling requests
ensureDefaultTemplates().catch((error) => {
  console.error('❌ Failed to seed default message templates:', error);
});

// GET all templates
router.get('/',
  authenticateToken,
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      const templates = await MessageTemplate.find({}).sort({ channel: 1, key: 1 });
      res.json({
        message: 'Message templates retrieved successfully',
        data: { templates }
      });
    } catch (error) {
      console.error('❌ Message Templates Retrieval Error:', error);
      res.status(500).json({
        error: 'Templates Retrieval Failed',
        message: 'An error occurred while fetching message templates'
      });
    }
  }
);

// BULK UPDATE templates
router.put('/bulk',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(messageTemplateBulkSchema),
  async (req, res) => {
    try {
      const updates = req.body.templates;
      const results = await Promise.all(updates.map(async (entry) => {
        const template = entry.id
          ? await MessageTemplate.findById(entry.id)
          : await MessageTemplate.findOne({ key: entry.key });
        if (!template) {
          const error = new Error(`Template ${entry.id || entry.key} not found`);
          error.status = 404;
          throw error;
        }
        template.title = entry.title ?? template.title;
        template.body = entry.body ?? template.body;
        template.signature = entry.signature ?? template.signature;
        if (entry.status) {
          template.status = entry.status;
        } else {
          template.status = 'draft';
        }
        template.lastUpdated = new Date();
        return template.save();
      }));

      res.json({
        message: 'Message templates updated successfully',
        data: { templates: results }
      });
    } catch (error) {
      console.error('❌ Message Templates Update Error:', error);
      res.status(error.status || 500).json({
        error: 'Templates Update Failed',
        message: error.message || 'An error occurred while updating templates'
      });
    }
  }
);

// RESET templates
router.post('/reset',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(messageTemplateResetSchema),
  async (req, res) => {
    try {
      const { keys } = req.body;
      const templates = await resetTemplates(keys);

      res.json({
        message: 'Message templates reset successfully',
        data: { templates }
      });
    } catch (error) {
      console.error('❌ Message Templates Reset Error:', error);
      res.status(500).json({
        error: 'Templates Reset Failed',
        message: 'An error occurred while resetting templates'
      });
    }
  }
);

// PUBLISH template
router.post('/publish',
  authenticateToken,
  authorize('admin', 'super_admin'),
  validate(messageTemplatePublishSchema),
  async (req, res) => {
    try {
      const { id, key } = req.body;
      const template = id
        ? await MessageTemplate.findById(id)
        : await MessageTemplate.findOne({ key });
      if (!template) {
        return res.status(404).json({
          error: 'Template Not Found',
          message: 'Message template could not be located'
        });
      }

      template.status = 'published';
      template.version += 1;
      template.lastUpdated = new Date();
      await template.save();

      res.json({
        message: 'Message template published successfully',
        data: { template }
      });
    } catch (error) {
      console.error('❌ Message Template Publish Error:', error);
      res.status(500).json({
        error: 'Template Publish Failed',
        message: 'An error occurred while publishing template'
      });
    }
  }
);

export default router;
