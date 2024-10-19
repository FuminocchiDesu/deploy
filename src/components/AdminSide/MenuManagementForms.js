import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MenuManagementForms = ({ onSubmit, initialData, formType, categories }) => {
  const [formData, setFormData] = useState({});
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
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
    let data = new FormData();

    data.append('coffee_shop', shopId);

    if (formType === 'category') {
      data.append('name', formData.name);
    } else {
      for (let key in formData) {
        if (key !== 'image' && key !== 'sizes') {
          data.append(key, formData[key]);
        }
      }

      if (formType === 'item') {
        data.append('sizes', JSON.stringify(sizes));
      }
    }

    if (imageFile) {
      data.append('image', imageFile);
    }

    if (initialData) {
      url = `${baseUrl}/${shopId}/menu-and-promos/${initialData.id}/manage_${formType}/`;
      method = 'PATCH';
    } else {
      url = `${baseUrl}/${shopId}/menu-and-promos/create_${formType}/`;
      method = 'POST';
    }

    console.log('Submitting data:', Object.fromEntries(data));

    try {
      const response = await fetch(url, {
        method,
        body: data,
        headers: { 
          'Authorization': `Bearer ${token}`,
        }
      });

      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      let errorMessage = `HTTP error! status: ${response.status}`;

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage += `, message: ${JSON.stringify(errorData)}`;
        } catch (jsonError) {
          errorMessage += `, non-JSON response received`;
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      setLoading(false);
      onSubmit(result, null);
    } catch (err) {
      setLoading(false);
      setError(`An error occurred while submitting the form: ${err.message}`);
      console.error('Error submitting form:', err);
      onSubmit(null, err.message);
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
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="mt-1 block w-full"
          />
          {initialData && initialData.image && (
            <img src={initialData.image} alt="Current item" className="mt-2 w-32 h-32 object-cover" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sizes and Prices</label>
          {sizes.map((size, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                value={size.size || ''}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                placeholder="Size"
                className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <input
                type="number"
                value={size.price || ''}
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
        <div>
          <label htmlFor="is_available" className="flex items-center">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available || false}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Available</span>
          </label>
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
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="mt-1 block w-full"
          />
          {initialData && initialData.image && (
            <img src={initialData.image} alt="Current promo" className="mt-2 w-32 h-32 object-cover" />
          )}
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