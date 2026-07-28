import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await base44.auth.resetPasswordRequest(email); } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Wallet className="w-8 h-8 text-emerald-600" />
          <span className="font-heading font-bold text-2xl">Festo</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-heading font-bold text-center mb-6">Восстановление пароля</h2>
          {sent ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.</p>
              <Link to="/login" className="text-emerald-600 hover:underline text-sm">Вернуться к входу</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Отправка...' : 'Отправить'}</Button>
              <p className="text-sm text-center"><Link to="/login" className="text-gray-500 hover:underline">Вернуться к входу</Link></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}