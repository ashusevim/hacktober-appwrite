import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID || '');

if (process.env.NODE_ENV !== 'production') {
  // Log configuration for debugging
  console.log('Appwrite Configuration:', {
    endpoint: process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.REACT_APP_APPWRITE_PROJECT_ID || '',
    databaseId: process.env.REACT_APP_APPWRITE_DATABASE_ID || '',
    collectionUsers: process.env.REACT_APP_APPWRITE_COLLECTION_USERS || 'users'
  });
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query };
export default client;