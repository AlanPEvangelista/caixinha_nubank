// API base URL - in development, this should point to the Express server
// In production, this should point to the same origin
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? '/api'  // Relative path for production
  : 'http://localhost:3002/api';  // Absolute path for development

/**
 * Hash a password
 * @param password The password to hash
 * @returns The hashed password
 */
async function hashPassword(password: string): Promise<string> {
  // No hashing for direct password comparison with backend
  return password;
}

/**
 * Compare a password with a hash
 * @param password The password to check
 * @param hash The hash to compare against
 * @returns Whether the password matches the hash
 */
async function comparePassword(password: string, hash: string): Promise<boolean> {
  // Direct comparison without base64 encoding
  return password === hash;
}

/**
 * Create a new user
 * @param username The username
 * @param password The password
 * @returns The created user ID
 */
export async function createUser(username: string, password: string): Promise<number> {
  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Make API call to create user
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password: hashedPassword
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user');
    }
    
    const userData = await response.json();
    return userData.id;
  } catch (error) {
    // Re-throw the error so it can be handled by the calling function
    throw error;
  }
}

/**
 * Authenticate a user
 * @param username The username
 * @param password The password
 * @returns The user ID if authentication is successful, null otherwise
 */
export async function authenticateUser(username: string, password: string): Promise<number | null> {
  try {
    console.log('Attempting to authenticate user:', username);
    // Hash the password for comparison
    const hashedPassword = await hashPassword(password);
    console.log('Sending authentication request with username:', username, 'and password:', hashedPassword);
    
    // Make API call to authenticate user
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password: hashedPassword
      })
    });
    
    console.log('Authentication response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Authentication failed with error:', errorData);
      return null;
    }
    
    const userData = await response.json();
    console.log('Authentication successful for user ID:', userData.id);
    return userData.id;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Get a user by ID
 * @param id The user ID
 * @returns The user object or null if not found
 */
export async function getUserById(id: number): Promise<{ id: number; username: string } | null> {
  try {
    // Make API call to get user
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    
    if (!response.ok) {
      return null;
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}