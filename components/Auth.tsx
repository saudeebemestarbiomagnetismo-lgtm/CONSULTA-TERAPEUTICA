
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const getUsers = (): User[] => {
    const saved = localStorage.getItem('biomagnet_users');
    return saved ? JSON.parse(saved) : [];
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }

    const users = getUsers();

    if (isLoginMode) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(username);
      } else {
        setError('Usuário ou senha incorretos');
      }
    } else {
      if (users.find(u => u.username === username)) {
        setError('Este usuário já existe');
        return;
      }
      const newUser: User = { username, password };
      localStorage.setItem('biomagnet_users', JSON.stringify([...users, newUser]));
      setIsLoginMode(true);
      alert('Conta criada com sucesso! Faça login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-purple-200 mx-auto mb-6">
            B
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">BioMagnet Assist</h1>
          <p className="text-slate-500 mt-2">Sua plataforma profissional de Biomagnetismo</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            {isLoginMode ? 'Bem-vindo de volta' : 'Crie sua conta profissional'}
          </h2>

          <form onSubmit={handleAction} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100 animate-bounce">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Usuário / E-mail</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: dr.biomagnetismo"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-purple-100 transition-all transform active:scale-[0.98]"
            >
              {isLoginMode ? 'Entrar no Sistema' : 'Cadastrar e Criar Conta'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-purple-600 font-bold hover:text-purple-700 transition-colors"
            >
              {isLoginMode ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Faça Login'}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          Acesso Restrito a Terapeutas
        </p>
      </div>
    </div>
  );
};

export default Auth;
