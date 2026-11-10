import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './Categories.css';

const Categories = ({ url }) => {
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/categories`);
      if (response.data.success) setCategories(response.data.data);
      else toast.error(response.data.message || 'Unable to load categories');
    } catch { toast.error('Unable to load categories'); }
    finally { setLoading(false); }
  }, [url]);

  useEffect(() => { if (!token) navigate('/'); else fetchCategories(); }, [token, navigate, fetchCategories]);

  const saveCategory = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = renaming
        ? await axios.patch(`${url}/api/food/categories/${renaming._id}`, { name }, { headers: { token } })
        : await axios.post(`${url}/api/food/categories`, { name }, { headers: { token } });
      if (!response.data.success) throw new Error(response.data.message || 'Unable to save category');
      toast.success(renaming ? 'Category renamed' : 'Category created');
      setName(''); setRenaming(null); await fetchCategories();
    } catch (error) { toast.error(error.response?.data?.message || error.message || 'Unable to save category'); }
    finally { setSaving(false); }
  };

  const deleteCategory = async (category) => {
    try {
      const response = await axios.delete(`${url}/api/food/categories/${category._id}`, { headers: { token } });
      if (!response.data.success) throw new Error(response.data.message || 'Unable to delete category');
      toast.success(response.data.message); await fetchCategories();
    } catch (error) { toast.error(error.response?.data?.message || error.message || 'Unable to delete category'); }
  };

  return <main className="categories-page">
    <header><div><p className="categories-eyebrow">MENU SETTINGS</p><h1>Categories</h1><p>Organize dishes and keep the customer menu easy to browse.</p></div></header>
    <form className="category-form" onSubmit={saveCategory}>
      <label htmlFor="category-name">{renaming ? `Rename “${renaming.name}”` : 'New category'}</label>
      <div><input id="category-name" value={name} onChange={(event) => setName(event.target.value)} minLength="2" maxLength="40" required placeholder="e.g. Breakfast" /><button disabled={saving}>{saving ? 'Saving…' : renaming ? 'Save name' : 'Add category'}</button>{renaming && <button type="button" className="secondary" onClick={() => { setRenaming(null); setName(''); }}>Cancel</button>}</div>
      <small>2–40 characters. Renaming also updates menu items in this category.</small>
    </form>
    <section className="category-list" aria-label="Category list">
      {loading && <p role="status">Loading categories…</p>}
      {!loading && categories.length === 0 && <p>No categories yet. Create one above.</p>}
      {!loading && categories.map((category) => <article key={category._id}><span>{category.name}</span><div><button type="button" onClick={() => { setRenaming(category); setName(category.name); }}>Rename</button><button type="button" className="danger" onClick={() => deleteCategory(category)}>Delete</button></div></article>)}
    </section>
  </main>;
};
export default Categories;
