import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const MenuManagementForms = ({ onSubmit, initialData, formType, categories }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [sizes, setSizes] = useState(initialData?.sizes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSizes(initialData.sizes || []);
    } else {
      setFormData({});
      setSizes([]);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  const addSize = () => {
    setSizes([...sizes, { size: '', price: '' }]);
  };

  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('ownerToken');
    const shopId = localStorage.getItem('coffeeShopId');
    const baseUrl = 'https://khlcle.pythonanywhere.com/api/coffee-shops';

    let url;
    let method;
    let data = { ...formData };
if (formType === 'item') {
  data.sizes = sizes;
  data.category = parseInt(data.category, 10); // Ensure category is sent as a number
}

   if (initialData) {
  // Update existing item
  url = `${baseUrl}/${shopId}/menu-and-promos/${initialData.id}/manage_${formType}/`;
} else {
  // Create new item
  url = `${baseUrl}/${shopId}/menu-and-promos/create_${formType}/`;
}

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setLoading(false);
      onSubmit(response.data, null);
        } catch (err) {
            onSubmit(null, error);
        setLoading(false);
        setError(`An error occurred while submitting the form: ${err.response?.data?.detail || err.message}`);
        console.error('Error submitting form:', err.response?.data || err);
      }
  };

  const renderCategoryForm = () => (
    <>
      <h3 className="text-lg font-semibold mb-2">
        {initialData ? 'Update Category' : 'Add Category'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={loading}>
          {loading ? 'Submitting...' : (initialData ? 'Update' : 'Add') + ' Category'}
        </button>
      </form>
    </>
  );

  const renderItemForm = () => (
    <>
      <h3 className="text-lg font-semibold mb-2">
        {initialData ? 'Update Item' : 'Add Item'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sizes and Prices</label>
          {sizes.map((size, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                value={size.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                placeholder="Size"
                className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <input
                type="number"
                value={size.price}
                onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                placeholder="Price"
                className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button type="button" onClick={() => removeSize(index)} className="text-red-500">
                <X size={20} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addSize} className="mt-2 text-blue-500">
            + Add Size
          </button>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={loading}>
          {loading ? 'Submitting...' : (initialData ? 'Update' : 'Add') + ' Item'}
        </button>
      </form>
    </>
  );

  const renderPromoForm = () => (
    <>
      <h3 className="text-lg font-semibold mb-2">
        {initialData ? 'Update Promo' : 'Add Promo'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date || ''}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date || ''}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={loading}>
          {loading ? 'Submitting...' : (initialData ? 'Update' : 'Add') + ' Promo'}
        </button>
      </form>
    </>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {formType === 'category' && renderCategoryForm()}
      {formType === 'item' && renderItemForm()}
      {formType === 'promo' && renderPromoForm()}
    </div>
  );
};

export default MenuManagementForms;