import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Register() {
  const [step, setStep] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    setError('');
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await base44.auth.verifyOtp({ email, otpCode });
      base44.auth.setToken(access_token);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Неверный код');
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
          {step === 'register' ? (
            <>
              <h2 className="text-xl font-heading font-bold text-center mb-6">Регистрация</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><Label>Пароль</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <div><Label>Подтвердите пароль</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</Button>
              </form>
              <div className="mt-4 text-center">
                <Button variant="outline" className="w-full" onClick={() => base44.auth.loginWithProvider('google', '/')}>Войти через Google</Button>
                <p className="text-sm text-gray-500 mt-3">Уже есть аккаунт? <Link to="/login" className="text-emerald-600 hover:underline">Войти</Link></p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-heading font-bold text-center mb-2">Подтверждение</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Введите код, отправленный на {email}</p>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Проверка...' : 'Подтвердить'}</Button>
              </form>
              <button onClick={() => base44.auth.resendOtp(email)} className="text-sm text-emerald-600 hover:underline mt-3 w-full text-center block">Отправить код повторно</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}