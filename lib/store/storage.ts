import storage from 'redux-persist/lib/storage';

// Define the storage interface
interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Create a no-op storage for SSR
const createNoopStorage = (): StorageInterface => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem() {
      return Promise.resolve();
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

// Create a storage wrapper that handles SSR properly
class NextJSStorage implements StorageInterface {
  private storage: StorageInterface;
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.storage = this.isClient ? storage : createNoopStorage();
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.isClient) {
      return null;
    }
    try {
      return await this.storage.getItem(key);
    } catch (error) {
      console.warn('Storage getItem failed:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.isClient) {
      return;
    }
    try {
      await this.storage.setItem(key, value);
    } catch (error) {
      console.warn('Storage setItem failed:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.isClient) {
      return;
    }
    try {
      await this.storage.removeItem(key);
    } catch (error) {
      console.warn('Storage removeItem failed:', error);
    }
  }
}

// Create and export the storage instance
export const reduxStorage = new NextJSStorage();

// Export a function to check if we're on the client side
export const isClient = (): boolean => typeof window !== 'undefined';
