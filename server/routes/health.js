const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

/**
 * Health Check Routes
 * Provides monitoring endpoints for API status and service health
 */

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {}
    };

    // Database health check
    try {
      const dbState = mongoose.connection.readyState;
      const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      health.services.database = {
        status: dbState === 1 ? 'OK' : 'ERROR',
        state: dbStatus[dbState],
        readyState: dbState
      };
    } catch (error) {
      health.services.database = {
        status: 'ERROR',
        error: error.message
      };
    }

    // Analytics service health check
    try {
      const analyticsStatus = analyticsService.getStatus();
      health.services.analytics = {
        status: 'OK',
        isRunning: analyticsStatus.isRunning,
        lastRun: analyticsStatus.lastRun,
        nextRun: analyticsStatus.nextRun
      };
    } catch (error) {
      health.services.analytics = {
        status: 'ERROR',
        error: error.message
      };
    }

    // Environment variables check
    const requiredEnvVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'INSTAGRAM_CLIENT_ID',
      'INSTAGRAM_CLIENT_SECRET',
      'YOUTUBE_CLIENT_ID',
      'YOUTUBE_CLIENT_SECRET',
      'ENCRYPTION_KEY'
    ];

    health.services.environment = {
      status: 'OK',
      missing: []
    };

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        health.services.environment.missing.push(envVar);
      }
    }

    if (health.services.environment.missing.length > 0) {
      health.services.environment.status = 'WARNING';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.services.memory = {
      status: 'OK',
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
    };

    // Overall status
    const allServices = Object.values(health.services);
    const hasErrors = allServices.some(service => service.status === 'ERROR');
    const hasWarnings = allServices.some(service => service.status === 'WARNING');

    if (hasErrors) {
      health.status = 'ERROR';
    } else if (hasWarnings) {
      health.status = 'WARNING';
    }

    const statusCode = hasErrors ? 503 : 200;
    res.status(statusCode).json(health);

  } catch (error) {
    // logger.error('Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      // Test database connection with a simple query
      await mongoose.connection.db.admin().ping();
      
      res.json({
        status: 'OK',
        state: dbStatus[dbState],
        readyState: dbState,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'ERROR',
        state: dbStatus[dbState],
        readyState: dbState,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // logger.error('Database health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Analytics service health check
router.get('/analytics', (req, res) => {
  try {
    const status = analyticsService.getStatus();
    
    res.json({
      status: 'OK',
      isRunning: status.isRunning,
      lastRun: status.lastRun,
      nextRun: status.nextRun,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // logger.error('Analytics health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manual trigger for analytics update
router.post('/analytics/trigger', async (req, res) => {
  try {
    await analyticsService.triggerUpdate();
    
    res.json({
      status: 'OK',
      message: 'Analytics update triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // logger.error('Manual analytics trigger error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Environment variables check
router.get('/environment', (req, res) => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI',
    'INSTAGRAM_CLIENT_ID',
    'INSTAGRAM_CLIENT_SECRET',
    'YOUTUBE_CLIENT_ID',
    'YOUTUBE_CLIENT_SECRET',
    'ENCRYPTION_KEY'
  ];

  const optionalEnvVars = [
    'NODE_ENV',
    'PORT',
    'FRONTEND_URL',
    'INSTAGRAM_REDIRECT_URI',
    'YOUTUBE_REDIRECT_URI',
    'YOUTUBE_API_KEY'
  ];

  const envStatus = {
    required: {},
    optional: {},
    missing: [],
    warnings: []
  };

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      envStatus.required[envVar] = 'SET';
    } else {
      envStatus.required[envVar] = 'MISSING';
      envStatus.missing.push(envVar);
    }
  }

  // Check optional environment variables
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      envStatus.optional[envVar] = 'SET';
    } else {
      envStatus.optional[envVar] = 'NOT_SET';
      envStatus.warnings.push(`${envVar} (optional)`);
    }
  }

  const status = envStatus.missing.length > 0 ? 'ERROR' : 
                 envStatus.warnings.length > 0 ? 'WARNING' : 'OK';

  const statusCode = envStatus.missing.length > 0 ? 503 : 200;

  res.status(statusCode).json({
    status,
    environment: envStatus,
    timestamp: new Date().toISOString()
  });
});

// Memory usage check
router.get('/memory', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const memInfo = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    // Check if memory usage is high (warning at 80% of heap)
    const heapUsagePercent = (memInfo.heapUsed / memInfo.heapTotal) * 100;
    const status = heapUsagePercent > 80 ? 'WARNING' : 'OK';

    res.json({
      status,
      memory: memInfo,
      heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // logger.error('Memory check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 