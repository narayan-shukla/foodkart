import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './List.css';


const List = ({ url }) => {
  const navigate = useNavigate();
  const { token } = useContext(StoreContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) setList(response.data.data);
      else toast.error(response.data.message || 'Unable to load menu');
    } catch { toast.error('Unable to load menu'); }
    finally { setLoading(false); }
  }, [url]);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchList();
    axios.get(`${url}/api/food/categories`).then((response) => {
      if (response.data.success) setCategories(response.data.data);
    }).catch(() => toast.error('Unable to load categories'));
  }, [token, navigate, fetchList, url]);

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, { headers: { token } });
      if (!response.data.success) return toast.error(response.data.message || 'Unable to remove item');
      toast.success('Menu item removed');
      await fetchList();
    } catch { toast.error('Unable to remove item'); }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    const form = new FormData();
    Object.entries(editing).forEach(([key, value]) => form.append(key, value));
    if (image) form.append('image', image);
    try {
      const response = await axios.post(`${url}/api/food/update`, form, { headers: { token } });
      if (!response.data.success) throw new Error(response.data.message || 'Unable to save changes');
      toast.success('Menu item updated');
      setEditing(null); setImage(null); await fetchList();
    } catch (error) { toast.error(error.response?.data?.message || error.message || 'Unable to save changes'); }
    finally { setSaving(false); }
  };

  return (
    <section className="list add flex-col" aria-labelledby="food-list-title">
      <h1 id="food-list-title">Menu items</h1>
      <div className="list-table">
        <div className="list-table-format title"><b>Image</b><b>Name</b><b>Category</b><b>Price</b><b>Actions</b></div>
        {loading && <p className="admin-empty" role="status">Loading menu…</p>}
        {!loading && list.length === 0 && <p className="admin-empty">No menu items yet. Add your first item.</p>}
        {list.map((item) => <div key={item._id} className="list-table-format">
          <img src={`${url}/images/${item.image}`} alt={item.name} />
          <p>{item.name}</p><p>{item.category}</p><p>${Number(item.price).toFixed(2)}</p>
          <div className="list-actions"><button type="button" onClick={() => { setEditing({ id: item._id, name: item.name, description: item.description, price: item.price, category: item.category }); setImage(null); }}>Edit</button><button type="button" className="danger" onClick={() => removeFood(item._id)} aria-label={`Delete ${item.name}`}>Delete</button></div>
        </div>)}
      </div>
      {editing && <div className="edit-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <form className="edit-dialog" onSubmit={saveEdit} aria-labelledby="edit-title">
          <div className="edit-dialog-head"><h2 id="edit-title">Edit menu item</h2><button type="button" onClick={() => setEditing(null)} aria-label="Close">×</button></div>
          <label>Name<input required maxLength="100" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label>
          <label>Description<textarea required maxLength="500" value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label>
          <div className="edit-fields"><label>Price<input required type="number" min="0.01" step="0.01" value={editing.price} onChange={(event) => setEditing({ ...editing, price: event.target.value })} /></label><label>Category<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}>{categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}</select></label></div>
          <label>Replace image (optional)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} /></label>
          <div className="edit-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button className="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
        </form>
      </div>}
    </section>
  );
};
export default List;
