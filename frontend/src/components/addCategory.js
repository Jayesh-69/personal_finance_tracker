import { useState } from 'react';

export default function AddCategory() {
  const [form, setForm] = useState({ name: '', type: 'expense', subcategory: '' });

  const addCategory = async () => {
    const res = await fetch('http://localhost:3000/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (data.success) {
      alert('Category added');
      setForm({ name: '', type: 'expense', subcategory: '' });
    } else {
      alert('Failed to add category');
    }
  };

  return (
    <div>
      <h3>Add Category</h3>
      <input placeholder="Category Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Subcategory" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
      <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <button onClick={addCategory}>Add</button>
    </div>
  );
}
