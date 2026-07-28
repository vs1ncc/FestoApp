import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Wallet className="w-8 h-8 text-emerald-600" />
          <span className="font-heading font-bold text-2xl">Festo</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-heading font-bold text-center mb-6">Вход</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Пароль</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Button variant="outline" className="w-full" onClick={() => base44.auth.loginWithProvider('google', '/')}>
              Войти через Google
            </Button>
            <p className="text-sm text-gray-500">
              Нет аккаунта? <Link to="/register" className="text-emerald-600 hover:underline">Регистрация</Link>
            </p>
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:underline">Забыли пароль?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}