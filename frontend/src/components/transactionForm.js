import { useState, useEffect } from 'react';

export default function TransactionForm({ userId }) {
  const [txn, setTxn] = useState({ amount: '', type: 'expense', categoryId: '', description: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  const addTxn = async () => {
    const res = await fetch('http://localhost:3000/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...txn, userId })
    });

    const data = await res.json();
    if (data.success) {
      alert('Transaction added');
      setTxn({ amount: '', type: 'expense', categoryId: '', description: '' });
    } else {
      alert('Failed');
    }
  };

  return (
    <div>
      <h3>Add Transaction</h3>
      <input placeholder="Amount" value={txn.amount} onChange={e => setTxn({ ...txn, amount: e.target.value })} />
      <select value={txn.categoryId} onChange={e => setTxn({ ...txn, categoryId: e.target.value })}>
        <option value="">-- Select Category --</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name} {cat.subcategory ? `(${cat.subcategory})` : ''}</option>
        ))}
      </select>
      <input placeholder="Description" value={txn.description} onChange={e => setTxn({ ...txn, description: e.target.value })} />
      <select value={txn.type} onChange={e => setTxn({ ...txn, type: e.target.value })}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <button onClick={addTxn}>Add</button>
    </div>
  );
}
