#!/usr/bin/env node

/**
 * Simple API Server for Nubank Tracker
 * This server provides a REST API for the Nubank Tracker application
 * using the local SQLite database.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from './localDatabase.cjs';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Log server startup
console.log('Nubank Tracker Server starting on port:', PORT);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Routes

// Create user
app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  db.createUser(username, password, (err, userId) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'User already exists' });
      }
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    res.status(201).json({ id: userId, username });
  });
});

// Authenticate user
app.post('/api/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  db.authenticateUser(username, password, (err, userId) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication failed' });
    }
    
    if (userId === null) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ id: userId, username });
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  db.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get user' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
});

// Create application
app.post('/api/applications', (req, res) => {
  const { application, userId } = req.body;
  
  if (!application || !userId) {
    return res.status(400).json({ error: 'Application and user ID are required' });
  }
  
  // Convert startDate string to Date object
  if (application.startDate && typeof application.startDate === 'string') {
    application.startDate = new Date(application.startDate);
  }
  
  db.createApplication(application, userId, (err, newApplication) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create application' });
    }
    
    res.status(201).json(newApplication);
  });
});

// Get applications
app.get('/api/applications/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  db.getApplications(userId, (err, applications) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get applications' });
    }
    
    res.json(applications);
  });
});

// Update application
app.put('/api/applications', (req, res) => {
  const { application, userId } = req.body;
  
  if (!application || !userId) {
    return res.status(400).json({ error: 'Application and user ID are required' });
  }
  
  // Convert startDate string to Date object
  if (application.startDate && typeof application.startDate === 'string') {
    application.startDate = new Date(application.startDate);
  }
  
  const userIdInt = parseInt(userId);
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  db.updateApplication(application, userIdInt, (err, updatedApplication) => {
    if (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: 'Application not found or not owned by user' });
      }
      return res.status(500).json({ error: 'Failed to update application' });
    }
    
    res.json(updatedApplication);
  });
});

// Delete application
app.delete('/api/applications/:id/:userId', (req, res) => {
  const { id, userId } = req.params;
  const userIdInt = parseInt(userId);
  
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  db.deleteApplication(id, userIdInt, (err) => {
    if (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: 'Application not found or not owned by user' });
      }
      return res.status(500).json({ error: 'Failed to delete application' });
    }
    
    res.status(204).send();
  });
});

// Create history entry
app.post('/api/history', (req, res) => {
  const { history, userId } = req.body;
  
  if (!history || !userId) {
    return res.status(400).json({ error: 'History and user ID are required' });
  }
  
  // Convert date string to Date object
  if (history.date && typeof history.date === 'string') {
    history.date = new Date(history.date);
  }
  
  db.createHistoryEntry(history, userId, (err, newHistory) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create history entry' });
    }
    
    res.status(201).json(newHistory);
  });
});

// Get history entries
app.get('/api/history/:applicationId/:userId', (req, res) => {
  const applicationId = req.params.applicationId;
  const userId = parseInt(req.params.userId);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  db.getHistoryEntries(applicationId, userId, (err, historyEntries) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get history entries' });
    }
    
    res.json(historyEntries);
  });
});

// Update history entry
app.put('/api/history', (req, res) => {
  const { history, userId } = req.body;
  
  if (!history || !userId) {
    return res.status(400).json({ error: 'History and user ID are required' });
  }
  
  // Convert date string to Date object
  if (history.date && typeof history.date === 'string') {
    history.date = new Date(history.date);
  }
  
  const userIdInt = parseInt(userId);
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  db.updateHistoryEntry(history, userIdInt, (err, updatedHistory) => {
    if (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: 'History entry not found or not owned by user' });
      }
      return res.status(500).json({ error: 'Failed to update history entry' });
    }
    
    res.json(updatedHistory);
  });
});

// Delete history entry
app.delete('/api/history/:id/:userId', (req, res) => {
  const { id, userId } = req.params;
  const userIdInt = parseInt(userId);
  
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  db.deleteHistoryEntry(id, userIdInt, (err) => {
    if (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: 'History entry not found or not owned by user' });
      }
      return res.status(500).json({ error: 'Failed to delete history entry' });
    }
    
    res.status(204).send();
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Nubank Tracker Server running at http://localhost:${PORT}`);
  console.log('Database file:', path.join(__dirname, '..', 'data', 'nubank_tracker.db'));
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});