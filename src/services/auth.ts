import { account, databases } from './appwrite';
import { ID } from 'appwrite';
import type { Models } from 'appwrite';
import { User } from '../types';

const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID || '';
const COLLECTION_USERS = process.env.REACT_APP_APPWRITE_COLLECTION_USERS || 'users';

type UserUpdatableField =
  | 'name'
  | 'bio'
  | 'avatar'
  | 'website'
  | 'location'
  | 'pronouns'
  | 'availability'
  | 'skills'
  | 'socialLinks';

const USER_UPDATE_FIELDS = new Set<UserUpdatableField>([
  'name',
  'bio',
  'avatar',
  'website',
  'location',
  'pronouns',
  'availability',
  'skills',
  'socialLinks'
]);

const isUserUpdatableField = (value: string): value is UserUpdatableField =>
  USER_UPDATE_FIELDS.has(value as UserUpdatableField);

const extractUnknownAttribute = (error: any): string | null => {
  const message =
    (typeof error?.message === 'string' && error.message) ||
    (typeof error?.response?.message === 'string' && error.response.message);

  if (!message) {
    return null;
  }

  const match = message.match(/Unknown attribute: "(.+?)"/);
  return match ? match[1] : null;
};

const sanitizeUserUpdateData = (data: Partial<User>): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
    if (!isUserUpdatableField(key) || value === undefined) {
      return;
    }

    if (key === 'skills' && Array.isArray(value)) {
      const cleanedSkills = value
        .map(skill => (typeof skill === 'string' ? skill.trim() : ''))
        .filter(Boolean);
      payload[key] = cleanedSkills;
      return;
    }

    if (key === 'socialLinks' && value && typeof value === 'object') {
      const cleanedLinks = Object.entries(value as Record<string, unknown>)
        .filter(([, link]) => typeof link === 'string' && link.trim().length > 0)
        .reduce<Record<string, string>>((acc, [linkKey, linkValue]) => {
          acc[linkKey] = (linkValue as string).trim();
          return acc;
        }, {});
      payload[key] = cleanedLinks;
      return;
    }

    if (typeof value === 'string') {
      payload[key] = value.trim();
      return;
    }

    payload[key] = value;
  });

  return payload;
};

// Configuration validation
const validateConfig = () => {
  const missingVars = [];
  
  if (!process.env.REACT_APP_APPWRITE_PROJECT_ID) {
    missingVars.push('REACT_APP_APPWRITE_PROJECT_ID');
  }
  if (!process.env.REACT_APP_APPWRITE_DATABASE_ID) {
    missingVars.push('REACT_APP_APPWRITE_DATABASE_ID');
  }
  if (!process.env.REACT_APP_APPWRITE_COLLECTION_USERS) {
    missingVars.push('REACT_APP_APPWRITE_COLLECTION_USERS');
  }
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file configuration.`);
  }
};

export class AuthService {
  private toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.map(item => String(item)) : [];
  }

  private normalizeSocialLinks(value: unknown): User['socialLinks'] {
    if (!value || typeof value !== 'object') {
      return {};
    }

    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, link]) => typeof link === 'string' && link);

    if (entries.length === 0) {
      return {};
    }

    const normalized: NonNullable<User['socialLinks']> = {};

    entries.forEach(([key, link]) => {
      normalized[key as keyof NonNullable<User['socialLinks']>] = link as string;
    });

    return normalized;
  }

  private mapUserDocument(doc: Models.Document): User {
    return {
      $id: doc.$id,
      name: (doc as any).name || '',
      email: (doc as any).email || '',
      bio: (doc as any).bio || '',
      avatar: (doc as any).avatar || '',
      website: (doc as any).website || '',
      location: (doc as any).location || '',
      pronouns: (doc as any).pronouns || '',
      availability: (doc as any).availability || '',
      skills: this.toStringArray((doc as any).skills),
      socialLinks: this.normalizeSocialLinks((doc as any).socialLinks) || {},
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
      createdBy: (doc as any).createdBy || ''
    };
  }

  private async createUserDocument(userId: string, data: Record<string, unknown>): Promise<Models.Document> {
    let payload = { ...data };

    while (true) {
      try {
        return await databases.createDocument(
          DATABASE_ID,
          COLLECTION_USERS,
          userId,
          payload
        );
      } catch (error: any) {
        console.error('Create user document error:', error);
        const unknownAttribute = extractUnknownAttribute(error);

        if (unknownAttribute) {
          if (['name', 'email', 'createdBy'].includes(unknownAttribute)) {
            throw error;
          }

          console.warn(`Appwrite collection missing attribute '${unknownAttribute}'. Skipping during user document creation.`);

          delete payload[unknownAttribute];

          if (isUserUpdatableField(unknownAttribute)) {
            USER_UPDATE_FIELDS.delete(unknownAttribute);
          }

          if (Object.keys(payload).length === 0) {
            throw new Error('Unable to create user profile. No valid fields remain.');
          }

          continue;
        }

        throw error;
      }
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      console.log('Starting login process for email:', email);
      
      // Check if there's already an active session
      const isLoggedIn = await this.isLoggedIn();
      console.log('Current login status:', isLoggedIn);
      
      if (isLoggedIn) {
        // If already logged in, check if it's the same user
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.email === email) {
          // Same user, return current user data
          console.log('User already logged in:', currentUser.email);
          return currentUser;
        } else {
          // Different user, logout all sessions first then login
          console.log('Different user detected, logging out existing sessions');
          try {
            await this.logoutAllSessions();
          } catch (logoutError) {
            console.warn('Failed to logout existing sessions:', logoutError);
            // Continue with login attempt even if logout fails
          }
        }
      }
      
      console.log('Creating email password session...');
      await account.createEmailPasswordSession(email, password);
      console.log('Session created successfully');
      
      // Add a small delay to ensure session is propagated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const user = await this.getCurrentUser();
      if (!user) {
        // If user document is not found, try to create it
        console.log('User document not found, attempting to create one...');
        try {
          const accountData = await account.get();
          const userDoc = await this.createUserDocument(accountData.$id, {
            email: accountData.email,
            name: accountData.name,
            createdBy: accountData.$id
          });
          console.log('User document created successfully:', userDoc);
          // Retry getting the user
          const newUser = await this.getCurrentUser();
          if (!newUser) {
            throw new Error('Failed to get user even after creating document.');
          }
          return newUser;
        } catch (creationError) {
          console.error('Failed to create user document:', creationError);
          console.error('Failed to retrieve user after login. Check:');
          console.error('1. DATABASE_ID:', DATABASE_ID);
          console.error('2. COLLECTION_USERS:', COLLECTION_USERS);
          console.error('3. That the collection exists in your Appwrite console');
          throw new Error('Failed to get user after login. Please check your Appwrite configuration (DATABASE_ID and COLLECTION_USERS)');
        }
      }
      console.log('Login successful for user:', user.email);
      return user;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response,
        stack: error.stack
      });
      
      // Provide more specific error messages
      if (error.message && error.message.includes('session')) {
        throw new Error('Session conflict detected. Please try again.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  }

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      validateConfig();
      
      const accountData = await account.create(ID.unique(), email, password, name);
      
      const defaultProfileData = sanitizeUserUpdateData({
        bio: '',
        avatar: '',
        website: '',
        location: '',
        pronouns: '',
        availability: '',
        skills: [],
        socialLinks: {}
      });

      const userDoc = await this.createUserDocument(accountData.$id, {
        name,
        email,
        createdBy: accountData.$id,
        ...defaultProfileData
      });

      return this.mapUserDocument(userDoc);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide more specific error messages
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Don't throw error if session doesn't exist or is already deleted
      if (error.message && !error.message.includes('session') && !error.message.includes('not found')) {
        throw error;
      }
    }
  }

  async logoutAllSessions(): Promise<void> {
    try {
      await account.deleteSessions();
    } catch (error: any) {
      console.error('Logout all sessions error:', error);
      // Don't throw error if no sessions exist
      if (error.message && !error.message.includes('session') && !error.message.includes('not found')) {
        throw error;
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      validateConfig();
      
      const accountData = await account.get();
      console.log('Account data retrieved, user ID:', accountData.$id);
      
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_USERS,
        accountData.$id
      );

      return this.mapUserDocument(userDoc);
    } catch (error: any) {
      console.error('Get current user error - Details:', {
        message: error.message,
        code: error.code,
        DATABASE_ID,
        COLLECTION_USERS
      });
      
      // Don't throw errors for authentication issues, but log configuration problems
      if (error.message && error.message.includes('Missing required environment variables')) {
        throw new Error('Configuration error: Missing required environment variables. Please check your .env file configuration.');
      } else if (error.message && error.message.includes('Collection with the requested ID could not be found')) {
        throw new Error(`Configuration error: Collection '${COLLECTION_USERS}' not found in database '${DATABASE_ID}'. Please check your Appwrite configuration.`);
      } else if (error.message && error.message.includes('Database with the requested ID could not be found')) {
        throw new Error(`Configuration error: Database '${DATABASE_ID}' not found. Please check your Appwrite configuration.`);
      } else if (error.message && error.message.includes('Document with the requested ID could not be found')) {
        console.error(`User document not found in collection '${COLLECTION_USERS}'. The user record may not have been created.`);
      }
      
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      validateConfig();

      const accountData = await account.get();

      if (data.name) {
        try {
          await account.updateName(data.name);
        } catch (nameError) {
          console.warn('Failed to update Appwrite account name:', nameError);
        }
      }

      let remainingPayload = sanitizeUserUpdateData(data);

      while (true) {
        if (Object.keys(remainingPayload).length === 0) {
          const existingDoc = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_USERS,
            accountData.$id
          );

          return this.mapUserDocument(existingDoc);
        }

        try {
          const userDoc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_USERS,
            accountData.$id,
            remainingPayload
          );

          return this.mapUserDocument(userDoc);
        } catch (error: any) {
          const unknownAttribute = extractUnknownAttribute(error);

          if (unknownAttribute) {
            console.warn(`Appwrite collection missing attribute '${unknownAttribute}'. Skipping during profile update.`);

            delete remainingPayload[unknownAttribute];

            if (isUserUpdatableField(unknownAttribute)) {
              USER_UPDATE_FIELDS.delete(unknownAttribute);
            }

            continue;
          }

          throw error;
        }
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error?.message || 'Profile update failed. Please try again.');
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      validateConfig();

      const userDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_USERS,
        userId
      );

      return this.mapUserDocument(userDoc);
    } catch (error: any) {
      console.error('Get user profile error:', error);
      if (error?.code === 404) {
        return null;
      }
      throw new Error(error.message || 'Unable to load user profile.');
    }
  }
}

export const authService = new AuthService();