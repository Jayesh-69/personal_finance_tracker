import { useNavigate } from 'react-router-dom';
import TransactionForm from './transactionForm.js';
import AddCategory from './addCategory';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      <h2>Welcome {user?.name}</h2>
      <button onClick={logout}>Logout</button>
      <TransactionForm userId={user.id} />
      <AddCategory />
    </div>
  );
}
