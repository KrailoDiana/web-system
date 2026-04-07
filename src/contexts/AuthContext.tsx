import React, { createContext, useContext, useState, useCallback } from 'react';

const generateId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

interface User {
  id: string;
  email: string;
  name: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getRegisteredUsers = (): StoredUser[] => {
  const saved = localStorage.getItem('registeredUsers');
  return saved ? JSON.parse(saved) : [];
};

const saveRegisteredUsers = (users: StoredUser[]) => {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getRegisteredUsers();
    const found = users.find(u => u.email === email);
    
    if (!found) {
      throw new Error('Користувача з таким email не знайдено. Спочатку зареєструйтесь.');
    }

    if (found.password !== password) {
      throw new Error('Невірний пароль');
    }

    const loggedInUser: User = { id: found.id, email: found.email, name: found.name };
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password.length < 6) {
      throw new Error('Пароль має бути не менше 6 символів');
    }

    const users = getRegisteredUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('Користувач з таким email вже існує');
    }

    const newUser: StoredUser = {
      id: generateId(),
      email,
      name,
      password,
    };

    saveRegisteredUsers([...users, newUser]);

    const loggedInUser: User = { id: newUser.id, email: newUser.email, name: newUser.name };
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
