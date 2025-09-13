import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();

  const handleLogin = async () => {
    await login();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to Compliance Management System</h2>
        <p>Please sign in with your Microsoft account to continue</p>
        
        <button onClick={handleLogin} className="login-btn">
          Sign in with Microsoft
        </button>
        
        <div className="login-info">
          <h3>Features:</h3>
          <ul>
            <li>License Management & Tracking</li>
            <li>Automated License Data Extraction</li>
            <li>Compliance Case Management</li>
            <li>Dashboard Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;