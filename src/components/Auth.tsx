import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import AppwriteTest from './AppwriteTest';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showTest, setShowTest] = useState(false);

  if (showTest) {
    return (
      <div>
        <button 
          onClick={() => setShowTest(false)}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to App
        </button>
        <AppwriteTest />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-4">
        <button 
          onClick={() => setShowTest(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Debug Appwrite Connection
        </button>
      </div>
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default Auth;