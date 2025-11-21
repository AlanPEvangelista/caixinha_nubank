import { Database } from 'sql.js';
import { Application, HistoryEntry } from '@/types';
import { sqliteService } from './sqliteService';

// Re-export functions from sqliteService for backward compatibility
export const initializeDatabase = sqliteService.initializeDatabase.bind(sqliteService);
export const getDatabase = sqliteService.getDatabase.bind(sqliteService);
export const closeDatabase = sqliteService.closeDatabase.bind(sqliteService);

// Database operations for users
export async function createUser(username: string, password: string): Promise<number> {
  const db = await getDatabase();
  
  console.log("Creating user with username:", username);
  
  // Check if user already exists
  console.log("Checking if user already exists...");
  const stmt = db.prepare('SELECT id FROM users WHERE username = ?');
  const result = stmt.getAsObject([username]);
  stmt.free();
  
  console.log("User existence check result:", result);
  
  // Check if any rows were returned
  if (result && result.id) {
    console.log("User already exists, throwing error");
    throw new Error('User already exists');
  }
  
  console.log("Username is available, proceeding with insertion");
  
  // Insert the new user
  console.log("Inserting new user...");
  const insertStmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  insertStmt.run([username, password]);
  insertStmt.free();
  console.log("User inserted successfully");
  
  // Save database immediately
  await sqliteService.saveDatabase();
  
  // Get the last inserted ID
  console.log("Getting last inserted ID...");
  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  console.log("Last insert ID result:", lastIdResult);
  
  // Return the ID if available
  if (lastIdResult && lastIdResult.length > 0 && lastIdResult[0].values && lastIdResult[0].values.length > 0) {
    const userId = lastIdResult[0].values[0][0] as number;
    console.log("Created user with ID:", userId);
    return userId;
  }
  
  // Fallback: throw an error
  console.error("Failed to get user ID after creation");
  throw new Error('Failed to get user ID after creation');
}

export async function authenticateUser(username: string, password: string): Promise<number | null> {
  const db = await getDatabase();
  
  // Get the user
  const stmt = db.prepare('SELECT id, password FROM users WHERE username = ?');
  const result = stmt.getAsObject([username]);
  stmt.free();
  
  // Check if user exists
  if (!result || !result.id) {
    return null;
  }
  
  // Check the password
  if (result.password !== password) {
    return null;
  }
  
  return result.id as number;
}

export async function getUserById(id: number): Promise<{ id: number; username: string } | null> {
  const db = await getDatabase();
  
  const stmt = db.prepare('SELECT id, username FROM users WHERE id = ?');
  const result = stmt.getAsObject([id]);
  stmt.free();
  
  // Check if user exists
  if (!result || !result.id) {
    return null;
  }
  
  return {
    id: result.id as number,
    username: result.username as string
  };
}

// Database operations for applications
export async function createApplication(application: Application, userId: number): Promise<Application> {
  const db = await getDatabase();
  
  const stmt = db.prepare('INSERT INTO applications (id, name, initial_value, start_date, user_id) VALUES (?, ?, ?, ?, ?)');
  stmt.run([
    application.id,
    application.name,
    application.initialValue,
    application.startDate.toISOString(),
    userId
  ]);
  stmt.free();
  
  // Save database immediately
  await sqliteService.saveDatabase();
  
  return {
    id: application.id,
    name: application.name,
    initialValue: application.initialValue,
    startDate: application.startDate
  };
}

export async function getApplications(userId: number): Promise<Application[]> {
  const db = await getDatabase();
  
  const stmt = db.prepare('SELECT id, name, initial_value as initialValue, start_date as startDate FROM applications WHERE user_id = ? ORDER BY start_date DESC');
  const result = stmt.getAsObjectAndValues([userId]);
  stmt.free();
  
  return result.values.map((row: any[]) => ({
    id: row[0],
    name: row[1],
    initialValue: row[2],
    startDate: new Date(row[3])
  }));
}

export async function updateApplication(application: Application, userId: number): Promise<Application> {
  const db = await getDatabase();
  
  const stmt = db.prepare('UPDATE applications SET name = ?, initial_value = ?, start_date = ? WHERE id = ? AND user_id = ?');
  stmt.run([
    application.name,
    application.initialValue,
    application.startDate.toISOString(),
    application.id,
    userId
  ]);
  stmt.free();
  
  // Save database immediately
  await sqliteService.saveDatabase();
  
  return application;
}

export async function deleteApplication(id: string, userId: number): Promise<void> {
  const db = await getDatabase();
  
  const stmt = db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?');
  stmt.run([id, userId]);
  stmt.free();
  
  // Save database immediately
  await sqliteService.saveDatabase();
}

// Database operations for history
export async function createHistoryEntry(history: HistoryEntry, userId: number): Promise<HistoryEntry> {
  const db = await getDatabase();
  
  const stmt = db.prepare('INSERT INTO history (id, application_id, date, gross_value, net_value, user_id) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run([
    history.id,
    history.applicationId,
    history.date.toISOString(),
    history.grossValue,
    history.netValue,
    userId
  ]);
  stmt.free();
  
  // Save database immediately
  await sqliteService.saveDatabase();
  
  return {
    id: history.id,
    applicationId: history.applicationId,
    date: history.date,
    grossValue: history.grossValue,
    netValue: history.netValue
  };
}

export async function getHistoryEntries(applicationId: string, userId: number): Promise<HistoryEntry[]> {
  const db = await getDatabase();
  
  const stmt = db.prepare('SELECT id, application_id as applicationId, date, gross_value as grossValue, net_value as netValue FROM history WHERE application_id = ? AND user_id = ? ORDER BY date DESC');
  const result = stmt.getAsObjectAndValues([applicationId, userId]);
  stmt.free();
  
  return result.values.map((row: any[]) => ({
    id: row[0],
    applicationId: row[1],
    date: new Date(row[2]),
    grossValue: row[3],
    netValue: row[4]
  }));
}

export async function updateHistoryEntry(history: HistoryEntry, userId: number): Promise<HistoryEntry> {
  const db = await getDatabase();
  
  const stmt = db.prepare('UPDATE history SET date = ?, gross_value = ?, net_value = ? WHERE id = ? AND user_id = ?');
  stmt.run([
    history.date.toISOString(),
    history.grossValue,
    history.netValue,
    history.id,
    userId
  ]);
  stmt.free();
  
  // Save database immediately
  await sqliteService.saveDatabase();
  
  return history;
}

export async function deleteHistoryEntry(id: string, userId: number): Promise<void> {
  const db = await getDatabase();
  
  const stmt = db.prepare('DELETE FROM history WHERE id = ? AND user_id = ?');
  stmt.run([id, userId]);
  stmt.free();
  
  // Save database immediately
  await sqliteService.saveDatabase();
}

/**
 * Test database functionality
 */
export async function testDatabase(): Promise<boolean> {
  try {
    console.log("Testing database functionality...");
    
    // Test creating a user
    console.log("Creating test user...");
    const testUsername = `test_user_${Date.now()}`;
    const testPassword = "test_password";
    
    const userId = await createUser(testUsername, testPassword);
    console.log("Test user created with ID:", userId);
    
    // Test retrieving the user
    console.log("Retrieving test user...");
    const user = await getUserById(userId);
    console.log("Retrieved user:", user);
    
    // Test authenticating the user
    console.log("Authenticating test user...");
    const authenticatedUserId = await authenticateUser(testUsername, testPassword);
    console.log("Authenticated user ID:", authenticatedUserId);
    
    console.log("Database test completed successfully");
    return true;
  } catch (error) {
    console.error("Database test failed:", error);
    return false;
  }
}

/**
 * Clear the database
 */
export async function clearDatabase(): Promise<void> {
  try {
    console.log("Clearing database...");
    
    // Reinitialize the database
    await sqliteService.closeDatabase();
    await sqliteService.initializeDatabase();
    console.log("Database reinitialized");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

/**
 * Export the database as a downloadable file
 */
export function exportDatabaseToFile() {
  getDatabase().then(db => {
    if (db) {
      try {
        const data = db.export();
        const blob = new Blob([data], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nubank_tracker.db';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Database exported to file successfully");
      } catch (error) {
        console.error("Error exporting database to file:", error);
      }
    }
  });
}