import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Пароли не совпадают'); return; }
    setError('');
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken: token, newPassword: password });
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || 'Ошибка сброса');
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
          <h2 className="text-xl font-heading font-bold text-center mb-6">Новый пароль</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Новый пароль</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div><Label>Подтвердите пароль</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}