import { ProductData, User, ValidationRecord } from '../types';
import { MOCK_USERS, MASTER_PRODUCT_DATABASE } from '../constants';

// --- Private Helper Functions ---

const _readTable = <T>(key: string): T[] => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Failed to read table "${key}" from localStorage`, error);
        return [];
    }
};

const _writeTable = <T>(key:string, data: T[]): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to write table "${key}" to localStorage`, error);
    }
};

// --- Database Initialization ---

const initializeDatabase = () => {
    // --- Users Table Initialization (Merge logic) ---
    // This ensures that the user list can be updated in constants.ts without
    // overwriting the entire table, preserving any potential future user changes.
    const localUsers = _readTable<User>('db_users');
    const userMap = new Map(localUsers.map(u => [u.id, u]));
    MOCK_USERS.forEach(user => userMap.set(user.id, user)); // Constants overwrite local for matching IDs
    _writeTable('db_users', Array.from(userMap.values()));

    // --- Products Table Initialization (Merge logic) ---
    // This is the core fix for data persistence. It merges the hardcoded master
    // database with any products the user has added or edited. User-added
    // products will have unique IDs and will be preserved.
    const localProducts = _readTable<ProductData>('db_products');
    const productMap = new Map(localProducts.map(p => [p.id, p]));
    MASTER_PRODUCT_DATABASE.forEach(product => {
        // Only add from master if an item with that ID doesn't already exist from local storage.
        if (!productMap.has(product.id)) {
            productMap.set(product.id, product);
        }
    });
    _writeTable('db_products', Array.from(productMap.values()));


    // --- History Table Initialization (Simple check) ---
    // History is append-only, so we just create it if it doesn't exist.
    if (!localStorage.getItem('db_history')) {
        _writeTable('db_history', []);
    }
};

// Initialize on load
initializeDatabase();


// --- Public API for Database Service (Simulating SQL queries) ---

export const databaseService = {
    // --- User Table ---
    getUsers: async (): Promise<User[]> => {
        const users = _readTable<User>('db_users');
        return Promise.resolve(users);
    },
    
    findUserByUsernameAndPassword: async (username: string, password: string): Promise<User | null> => {
        const users = _readTable<User>('db_users');
        const user = users.find(u => u.username === username && u.password === password);
        return Promise.resolve(user || null);
    },

    // --- Product Table ---
    getProducts: async (): Promise<ProductData[]> => {
        const products = _readTable<ProductData>('db_products');
        return Promise.resolve(products);
    },
    
    findProductByBarcode: async (barcode: string): Promise<ProductData | null> => {
        if (!barcode) return Promise.resolve(null);
        const products = _readTable<ProductData>('db_products');
        const product = products.find(p => p.barcode === barcode);
        return Promise.resolve(product || null);
    },

    addProduct: async (newProduct: ProductData): Promise<ProductData> => {
        const products = _readTable<ProductData>('db_products');
        // Add to the beginning of the array
        const updatedProducts = [newProduct, ...products];
        _writeTable('db_products', updatedProducts);
        return Promise.resolve(newProduct);
    },

    updateProduct: async (updatedProduct: ProductData): Promise<ProductData> => {
        let products = _readTable<ProductData>('db_products');
        products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        _writeTable('db_products', products);
        return Promise.resolve(updatedProduct);
    },

    deleteProduct: async (productId: string): Promise<void> => {
        let products = _readTable<ProductData>('db_products');
        products = products.filter(p => p.id !== productId);
        _writeTable('db_products', products);
        return Promise.resolve();
    },

    // --- History Table ---
    getHistory: async (): Promise<ValidationRecord[]> => {
        const history = _readTable<ValidationRecord>('db_history');
        return Promise.resolve(history);
    },

    addHistoryRecord: async (record: ValidationRecord): Promise<ValidationRecord> => {
        const history = _readTable<ValidationRecord>('db_history');
        const updatedHistory = [record, ...history];
        _writeTable('db_history', updatedHistory);
        return Promise.resolve(record);
    }
};