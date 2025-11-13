import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProductData } from '../types';
import { databaseService } from '../services/databaseService';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { SearchIcon } from './icons/SearchIcon';

// Helper to get today's date in 'YYYY-MM-DD' format for the input[type=date]
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

const ProductFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: ProductData) => void;
    product: ProductData | null;
}> = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState<Omit<ProductData, 'id'>>({
        productName: '',
        batchNumberFormat: '',
        barcode: '',
        productionDate: getTodayDateString(),
    });

    React.useEffect(() => {
        if (isOpen) {
            if (product) {
                // Editing an existing product
                setFormData({
                    productName: product.productName,
                    batchNumberFormat: product.batchNumberFormat,
                    barcode: product.barcode,
                    productionDate: product.productionDate,
                });
            } else {
                // Adding a new product, reset form and set date to today
                setFormData({
                    productName: '',
                    batchNumberFormat: '',
                    barcode: '',
                    productionDate: getTodayDateString(),
                });
            }
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prompt if barcode is missing
        if (!formData.barcode.trim()) {
            if (!window.confirm('This product has no barcode. Are you sure you want to save?')) {
                return; // Stop submission if user cancels
            }
        }
        
        // Final check to default the date if the user manually cleared it
        const productToSave = {
          ...formData,
          productionDate: formData.productionDate || getTodayDateString(),
        };

        onSave({
            ...productToSave,
            id: product?.id || `prod-${Date.now()}`
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"><XIcon /></button>
                    <div className="space-y-4">
                        <input name="productName" value={formData.productName} onChange={handleChange} placeholder="Product Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                        <input name="batchNumberFormat" value={formData.batchNumberFormat} onChange={handleChange} placeholder="Batch Format (e.g., HH:MM NNS11)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                        <input name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Barcode (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                        <input name="productionDate" value={formData.productionDate} onChange={handleChange} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const DatabasePage: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<ProductData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

    const isAdmin = user?.role === 'admin';

    // Fetch products from the database service on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            const data = await databaseService.getProducts();
            setProducts(data);
        };
        fetchProducts();
    }, []);
    
    const filteredProducts = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        if (!lowercasedQuery) {
            return products;
        }
        return products.filter(product =>
            product.productName.toLowerCase().includes(lowercasedQuery) ||
            product.batchNumberFormat.toLowerCase().includes(lowercasedQuery)
        );
    }, [products, searchQuery]);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: ProductData) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await databaseService.deleteProduct(productId);
            // Optimistically update UI
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        }
    };
    
    const handleSaveProduct = async (product: ProductData) => {
        const isEditing = products.some(p => p.id === product.id);

        if (isEditing) {
            await databaseService.updateProduct(product);
            // Optimistically update UI
            setProducts(prevProducts => prevProducts.map(p => p.id === product.id ? product : p));
        } else {
            await databaseService.addProduct(product);
            // Optimistically update UI
            setProducts(prevProducts => [product, ...prevProducts]);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Product Master Database</h1>
                            <p className="mt-2 text-gray-500">Viewing all registered products in the factory database.</p>
                        </div>
                        {isAdmin && (
                            <button onClick={handleAddProduct} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition">
                                <PlusIcon className="w-5 h-5 mr-2"/>
                                Add Product
                            </button>
                        )}
                    </div>
                     {!isAdmin && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                            You are viewing in read-only mode. Administrator access is required to make changes.
                        </div>
                    )}
                    
                    <div className="mt-6">
                        <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                id="table-search"
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Search by Product Name or Batch Format..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product Name</th>
                                    <th scope="col" className="px-6 py-3">Batch Format</th>
                                    <th scope="col" className="px-6 py-3">Barcode</th>
                                    <th scope="col" className="px-6 py-3">Production Date</th>
                                    {isAdmin && <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.productName || 'N/A'}</th>
                                        <td className="px-6 py-4 font-mono">{product.batchNumberFormat || 'N/A'}</td>
                                        <td className="px-6 py-4 font-mono">{product.barcode || 'N/A'}</td>
                                        <td className="px-6 py-4">{product.productionDate}</td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => handleEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredProducts.length === 0 && (
                            <div className="text-center p-8 text-gray-500">
                                <p className="font-semibold">No products found</p>
                                <p className="text-sm mt-1">
                                    {searchQuery ? `Your search for "${searchQuery}" did not match any products.` : "The product database is empty."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                product={editingProduct}
            />
        </>
    );
};

export default DatabasePage;