import { useState } from 'react';

export default function useAppLevelAuth() {
  const [user, setUser] = useState({
    id: 'user-1',
    name: 'Jennifer',
    email: 'jennifer_k1@hotmail.com',
    isAuthenticated: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setIsLoading(true);
    // Mock login logic
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}