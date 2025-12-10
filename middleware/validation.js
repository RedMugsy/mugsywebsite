import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'The provided data is invalid',
        details: errorDetails
      });
    }
    
    req.body = value;
    next();
  };
};

// Query parameter validation
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        error: 'Query Validation Error',
        message: 'The provided query parameters are invalid',
        details: errorDetails
      });
    }
    
    req.query = value;
    next();
  };
};

// Promoter registration validation schema
export const promoterRegistrationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),
  
  organization: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

// Promoter login validation schema
export const promoterLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Participant login validation schema
export const participantLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  turnstileToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Turnstile verification is required'
    })
});// Password reset request schema
export const passwordResetRequestSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Password reset schema
export const passwordResetSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// Treasure hunt creation/update schema
export const treasureHuntSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .trim()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),
  
  shortDescription: Joi.string()
    .trim()
    .max(300)
    .optional()
    .allow(''),
  
  category: Joi.string()
    .valid('adventure', 'puzzle', 'photo', 'location', 'trivia', 'mixed')
    .required()
    .messages({
      'any.only': 'Category must be one of: adventure, puzzle, photo, location, trivia, mixed',
      'any.required': 'Category is required'
    }),
  
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard', 'expert')
    .required()
    .messages({
      'any.only': 'Difficulty must be one of: easy, medium, hard, expert',
      'any.required': 'Difficulty is required'
    }),
  
  location: Joi.object({
    coordinates: Joi.array()
      .items(Joi.number().min(-180).max(180))
      .length(2)
      .required()
      .messages({
        'array.length': 'Coordinates must contain exactly 2 numbers [longitude, latitude]',
        'any.required': 'Location coordinates are required'
      }),
    
    address: Joi.object({
      street: Joi.string().trim().optional().allow(''),
      city: Joi.string().trim().optional().allow(''),
      state: Joi.string().trim().optional().allow(''),
      country: Joi.string().trim().optional().allow(''),
      zipCode: Joi.string().trim().optional().allow('')
    }).optional(),
    
    radius: Joi.number()
      .min(10)
      .max(10000)
      .default(1000)
      .optional()
  }).required(),
  
  schedule: Joi.object({
    startDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Start date must be in the future',
        'any.required': 'Start date is required'
      }),
    
    endDate: Joi.date()
      .greater(Joi.ref('startDate'))
      .required()
      .messages({
        'date.greater': 'End date must be after start date',
        'any.required': 'End date is required'
      }),
    
    registrationDeadline: Joi.date()
      .less(Joi.ref('startDate'))
      .required()
      .messages({
        'date.less': 'Registration deadline must be before start date',
        'any.required': 'Registration deadline is required'
      }),
    
    timezone: Joi.string()
      .default('UTC')
      .optional()
  }).required(),
  
  participation: Joi.object({
    maxParticipants: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.min': 'Maximum participants must be at least 1',
        'number.max': 'Maximum participants cannot exceed 10000',
        'any.required': 'Maximum participants is required'
      }),
    
    minTeamSize: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional(),
    
    maxTeamSize: Joi.number()
      .integer()
      .min(Joi.ref('minTeamSize'))
      .default(1)
      .optional()
  }).required(),
  
  pricing: Joi.object({
    registrationFee: Joi.object({
      pathfinder: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Pathfinder fee must be 0 or greater',
          'any.required': 'Pathfinder fee is required'
        }),
      
      keymaster: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Keymaster fee must be 0 or greater',
          'any.required': 'Keymaster fee is required'
        })
    }).required(),
    
    currency: Joi.string()
      .valid('SOL', 'USDC', 'BONK')
      .default('SOL')
      .optional(),
    
    walletAddress: Joi.string()
      .pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid Solana wallet address',
        'any.required': 'Wallet address is required'
      })
  }).required(),
  
  rules: Joi.string()
    .max(2000)
    .optional()
    .allow(''),
  
  settings: Joi.object({
    isPublic: Joi.boolean().default(true).optional(),
    allowTeams: Joi.boolean().default(false).optional(),
    requireApproval: Joi.boolean().default(false).optional(),
    sendReminders: Joi.boolean().default(true).optional(),
    trackLocation: Joi.boolean().default(false).optional()
  }).optional()
});

// Participant registration schema
export const participantRegistrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  
  age: Joi.number()
    .integer()
    .min(1)
    .max(120)
    .optional(),
  
  tier: Joi.string()
    .valid('pathfinder', 'keymaster')
    .required()
    .messages({
      'any.only': 'Tier must be either pathfinder or keymaster',
      'any.required': 'Tier selection is required'
    }),
  
  paymentDetails: Joi.object({
    transactionId: Joi.string()
      .required()
      .messages({
        'any.required': 'Transaction ID is required'
      }),
    
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Payment amount must be positive',
        'any.required': 'Payment amount is required'
      }),
    
    currency: Joi.string()
      .valid('SOL', 'USDC', 'BONK')
      .default('SOL')
      .optional(),
    
    walletAddress: Joi.string()
      .pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid Solana wallet address',
        'any.required': 'Wallet address is required'
      })
  }).required(),
  
  emergencyContact: Joi.object({
    name: Joi.string().trim().max(100).optional().allow(''),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().allow(''),
    relationship: Joi.string().trim().max(50).optional().allow('')
  }).optional()
});

export const messageTemplateUpdateSchema = Joi.object({
  id: Joi.string().optional(),
  key: Joi.string().optional(),
  title: Joi.string().max(255).allow('').optional(),
  body: Joi.string().max(8000).allow('').optional(),
  signature: Joi.string().max(500).allow('').optional(),
  status: Joi.string().valid('draft', 'published').optional()
}).or('id', 'key');

export const messageTemplateBulkSchema = Joi.object({
  templates: Joi.array().items(messageTemplateUpdateSchema).min(1).required()
});

export const messageTemplateResetSchema = Joi.object({
  keys: Joi.array().items(Joi.string()).optional()
});

export const messageTemplatePublishSchema = Joi.object({
  id: Joi.string().optional(),
  key: Joi.string().optional()
}).or('id', 'key');

// Query schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

export const treasureHuntQuerySchema = Joi.object({
  status: Joi.string().valid('draft', 'published', 'active', 'completed', 'cancelled', 'paused').optional(),
  category: Joi.string().valid('adventure', 'puzzle', 'photo', 'location', 'trivia', 'mixed').optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').optional(),
  search: Joi.string().trim().max(100).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
}).concat(paginationSchema);

export default {
  validate,
  validateQuery,
  promoterRegistrationSchema,
  promoterLoginSchema,
  participantLoginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  treasureHuntSchema,
  participantRegistrationSchema,
  messageTemplateUpdateSchema,
  messageTemplateBulkSchema,
  messageTemplateResetSchema,
  messageTemplatePublishSchema,
  paginationSchema,
  treasureHuntQuerySchema
};
