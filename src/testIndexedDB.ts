// Simple test for IndexedDB functionality
export function testIndexedDB(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open('testDB', 1);
    
    request.onerror = () => {
      console.error('IndexedDB not supported or error occurred');
      resolve(false);
    };
    
    request.onsuccess = () => {
      console.log('IndexedDB is working correctly');
      request.result.close();
      // Clean up
      indexedDB.deleteDatabase('testDB');
      resolve(true);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('testStore')) {
        db.createObjectStore('testStore', { keyPath: 'id' });
      }
    };
  });
}

// Run the test
testIndexedDB().then(result => {
  console.log('IndexedDB test result:', result);
});