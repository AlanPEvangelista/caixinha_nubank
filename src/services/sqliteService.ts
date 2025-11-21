import initSqlJs, { Database } from 'sql.js';

// Service to manage SQLite database persistence using IndexedDB
class SqliteService {
  private db: Database | null = null;
  private isInitialized = false;
  private dbName = 'nubankTracker';
  private dbVersion = 1;

  /**
   * Initialize the database connection with persistence
   */
  async initializeDatabase(): Promise<Database> {
    console.log("Initializing persistent SQLite database...");
    
    if (this.db && this.isInitialized) {
      console.log("Database already initialized");
      return this.db;
    }

    try {
      console.log("Loading SQL.js...");
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      console.log("SQL.js loaded successfully");
      
      // Try to load existing database from IndexedDB first
      const savedDbData = await this.loadDatabaseFromIndexedDB();
      if (savedDbData) {
        console.log("Found existing database in IndexedDB, size:", savedDbData.length);
        try {
          this.db = new SQL.Database(savedDbData);
          console.log("Database loaded from IndexedDB");
          this.isInitialized = true;
          return this.db;
        } catch (parseError) {
          console.error("Error parsing saved database, creating new one:", parseError);
        }
      }
      
      // Create a new database in memory
      this.db = new SQL.Database();
      console.log("New database created in memory");
      
      // Initialize database schema
      this.initializeSchema();
      
      // Save the initial database state
      await this.saveDatabaseToIndexedDB();
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
      
      return this.db;
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  /**
   * Initialize database schema
   */
  private initializeSchema() {
    if (!this.db) return;
    
    // Define the database schema
    const CREATE_USERS_TABLE = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const CREATE_APPLICATIONS_TABLE = `
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        initial_value REAL NOT NULL,
        start_date DATETIME NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const CREATE_HISTORY_TABLE = `
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        date DATETIME NOT NULL,
        gross_value REAL NOT NULL,
        net_value REAL NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create tables if they don't exist
    console.log("Creating users table...");
    this.db.run(CREATE_USERS_TABLE);
    console.log("Users table created");
    
    console.log("Creating applications table...");
    this.db.run(CREATE_APPLICATIONS_TABLE);
    console.log("Applications table created");
    
    console.log("Creating history table...");
    this.db.run(CREATE_HISTORY_TABLE);
    console.log("History table created");
    
    // List all tables to see what we have
    try {
      const allTables = this.db.exec("SELECT name FROM sqlite_master WHERE type='table';");
      console.log("All tables in database:", allTables);
    } catch (listError) {
      console.error("Error listing tables:", listError);
    }
  }

  /**
   * Save the database to IndexedDB
   */
  async saveDatabase() {
    if (this.db) {
      try {
        console.log("Exporting database data...");
        const data = this.db.export();
        console.log("Database exported, size:", data.length);
        
        await this.saveDatabaseToIndexedDB(data);
        console.log("Database saved to IndexedDB successfully");
      } catch (error) {
        console.error("Error saving database:", error);
      }
    }
  }

  /**
   * Save database data to IndexedDB
   */
  private async saveDatabaseToIndexedDB(data?: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error("Error opening IndexedDB:", request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['databases'], 'readwrite');
        const store = transaction.objectStore('databases');
        
        const dbData = data || (this.db ? this.db.export() : new Uint8Array(0));
        const saveRequest = store.put({ 
          id: 'main', 
          data: dbData,
          timestamp: new Date().toISOString()
        });
        
        saveRequest.onsuccess = () => {
          console.log("Database saved to IndexedDB");
          resolve();
        };
        
        saveRequest.onerror = () => {
          console.error("Error saving to IndexedDB:", saveRequest.error);
          reject(saveRequest.error);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('databases')) {
          db.createObjectStore('databases', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Load database data from IndexedDB
   */
  private async loadDatabaseFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error("Error opening IndexedDB:", request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['databases'], 'readonly');
        const store = transaction.objectStore('databases');
        
        const getRequest = store.get('main');
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            console.log("Database loaded from IndexedDB");
            resolve(getRequest.result.data);
          } else {
            console.log("No existing database found in IndexedDB");
            resolve(null);
          }
        };
        
        getRequest.onerror = () => {
          console.error("Error loading from IndexedDB:", getRequest.error);
          reject(getRequest.error);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('databases')) {
          db.createObjectStore('databases', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Get the database instance
   */
  async getDatabase(): Promise<Database> {
    if (!this.db || !this.isInitialized) {
      await this.initializeDatabase();
    }
    return this.db!;
  }

  /**
   * Close the database connection and save
   */
  async closeDatabase(): Promise<void> {
    // Save the database one final time before closing
    await this.saveDatabase();
    
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const sqliteService = new SqliteService();

// Export database functions for backward compatibility
export async function initializeDatabase() {
  return sqliteService.initializeDatabase();
}

export async function getDatabase() {
  return sqliteService.getDatabase();
}

export async function closeDatabase() {
  return sqliteService.closeDatabase();
}