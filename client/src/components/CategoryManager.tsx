import React, { useState, useEffect } from 'react';
import { ImageUpload } from './ImageUpload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  GripVertical,
  Tag
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
}

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?active=false');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories([...categories, result.data]);
        resetForm();
      } else {
        alert('Failed to create category: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? result.data : cat
        ));
        resetForm();
      } else {
        alert('Failed to update category: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleToggleStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories(categories.map(cat => 
          cat.id === categoryId ? { ...cat, isActive } : cat
        ));
      } else {
        alert('Failed to update category status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating category status:', error);
      alert('Failed to update category status');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
      } else {
        alert('Failed to delete category: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      image: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      handleUpdateCategory();
    } else {
      handleCreateCategory();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Tag className="w-6 h-6 mr-2" />
          Category Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <ImageUpload
                  folder="category"
                  currentImage={formData.image}
                  onUpload={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload category image"
                  className="h-32"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
              !category.isActive ? 'opacity-60' : ''
            }`}
          >
            {/* Category Image */}
            <div className="h-32 bg-gray-200 relative">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    category.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Category Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleToggleStatus(category.id, !category.isActive)}
                    className={`p-1 ${
                      category.isActive
                        ? 'text-gray-400 hover:text-red-600'
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                    title={category.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {category.isActive ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <GripVertical className="w-3 h-3 mr-1" />
                  Order: {category.sortOrder}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first category to organize your menu items.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      )}
    </div>
  );
};