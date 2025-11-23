// API base URL - in development, this should point to the Express server
// In production, this should point to the same origin
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? '/api'  // Relative path for production
  : 'http://localhost:3002/api';  // Absolute path for development

/**
 * Create a new application
 * @param application The application data
 * @param userId The user ID
 * @returns The created application
 */
export async function createApplication(application: any, userId: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        application,
        userId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create application');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating application:", error);
    throw error;
  }
}

/**
 * Get all applications for a user
 * @param userId The user ID
 * @returns Array of applications
 */
export async function getApplications(userId: number): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
}

/**
 * Update an application
 * @param application The application data
 * @param userId The user ID
 * @returns The updated application
 */
export async function updateApplication(application: any, userId: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        application,
        userId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update application');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
}

/**
 * Delete an application
 * @param id The application ID
 * @param userId The user ID
 */
export async function deleteApplication(id: string, userId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${id}/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete application');
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
}

/**
 * Create a new history entry
 * @param history The history data
 * @param userId The user ID
 * @returns The created history entry
 */
export async function createHistoryEntry(history: any, userId: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        userId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create history entry');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating history entry:", error);
    throw error;
  }
}

/**
 * Get history entries for an application
 * @param applicationId The application ID
 * @param userId The user ID
 * @returns Array of history entries
 */
export async function getHistoryEntries(applicationId: string, userId: number): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${applicationId}/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch history entries');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching history entries:", error);
    throw error;
  }
}

/**
 * Update a history entry
 * @param history The history data
 * @param userId The user ID
 * @returns The updated history entry
 */
export async function updateHistoryEntry(history: any, userId: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        userId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update history entry');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating history entry:", error);
    throw error;
  }
}

/**
 * Delete a history entry
 * @param id The history entry ID
 * @param userId The user ID
 */
export async function deleteHistoryEntry(id: string, userId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${id}/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete history entry');
    }
  } catch (error) {
    console.error("Error deleting history entry:", error);
    throw error;
  }
}