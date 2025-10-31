import React, { useState } from 'react';
import { account, databases } from '../services/appwrite';

const AppwriteTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAppwriteConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Check if we can reach Appwrite
      addResult('Testing Appwrite connection...');
      
      // Test 2: Try to get account info (this will fail if not authenticated, but should not throw network errors)
      try {
        await account.get();
        addResult('✅ Account service is accessible');
      } catch (error: any) {
        if (error.message.includes('User (role: guest) missing scope (account)')) {
          addResult('✅ Account service is accessible (authentication required)');
        } else {
          addResult(`❌ Account service error: ${error.message}`);
        }
      }

      // Test 3: Check environment variables
      addResult(`Project ID: ${process.env.REACT_APP_APPWRITE_PROJECT_ID || 'NOT SET'}`);
      addResult(`Database ID: ${process.env.REACT_APP_APPWRITE_DATABASE_ID || 'NOT SET'}`);
      addResult(`Collection Users: ${process.env.REACT_APP_APPWRITE_COLLECTION_USERS || 'NOT SET'}`);

      // Test 4: Try to access database (this will fail if not authenticated, but should not throw network errors)
      try {
        const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID || '';
        const collectionId = process.env.REACT_APP_APPWRITE_COLLECTION_USERS || '';
        
        if (databaseId && collectionId) {
          await databases.listDocuments(databaseId, collectionId);
          addResult('✅ Database service is accessible');
        } else {
          addResult('⚠️ Database/Collection IDs not configured');
        }
      } catch (error: any) {
        if (error.message.includes('User (role: guest) missing scope')) {
          addResult('✅ Database service is accessible (authentication required)');
        } else {
          addResult(`❌ Database service error: ${error.message}`);
        }
      }

    } catch (error: any) {
      addResult(`❌ Connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    const email = prompt('Enter email for login test:');
    const password = prompt('Enter password for login test:');
    
    if (!email || !password) {
      addResult('❌ Email and password required for login test');
      return;
    }

    setLoading(true);
    addResult(`Testing login with email: ${email}`);
    
    try {
      await account.createEmailPasswordSession(email, password);
      addResult('✅ Login successful!');
      
      // Get user info
      const user = await account.get();
      addResult(`✅ User ID: ${user.$id}`);
      addResult(`✅ User Email: ${user.email}`);
      addResult(`✅ User Name: ${user.name}`);
      
    } catch (error: any) {
      addResult(`❌ Login failed: ${error.message}`);
      addResult(`❌ Error code: ${error.code || 'N/A'}`);
      addResult(`❌ Error type: ${error.type || 'N/A'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    const email = prompt('Enter email for registration test:');
    const password = prompt('Enter password for registration test:');
    const name = prompt('Enter name for registration test:');
    
    if (!email || !password || !name) {
      addResult('❌ Email, password, and name required for registration test');
      return;
    }

    setLoading(true);
    addResult(`Testing registration with email: ${email}`);
    
    try {
      const user = await account.create('unique()', email, password, name);
      addResult('✅ Registration successful!');
      addResult(`✅ User ID: ${user.$id}`);
      addResult(`✅ User Email: ${user.email}`);
      addResult(`✅ User Name: ${user.name}`);
      
    } catch (error: any) {
      addResult(`❌ Registration failed: ${error.message}`);
      addResult(`❌ Error code: ${error.code || 'N/A'}`);
      addResult(`❌ Error type: ${error.type || 'N/A'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Appwrite Connection Test</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testAppwriteConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Appwrite Connection
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          Test Login
        </button>
        
        <button
          onClick={testRegister}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 ml-4"
        >
          Test Registration
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Test Results:</h3>
        <div className="space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click a button above to start testing.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppwriteTest;
