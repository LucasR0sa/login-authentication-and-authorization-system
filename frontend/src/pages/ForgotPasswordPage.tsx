import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import LeftPanel from '../components/LeftPanel';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise<void>(r => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[960px] rounded-2xl shadow-xl overflow-hidden flex" style={{ minHeight: 580 }}>
        <LeftPanel />

        <div className="flex-1 bg-white flex items-center justify-center p-10">
          <div className="w-full max-w-[340px]">
            <h1 className="text-[22px] font-bold text-[#111827] mb-1">Forgot password</h1>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              Email to send reset instructions to
            </p>

            {sent ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
                Instructions sent! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  error={error}
                  autoComplete="email"
                />
                <div className="pt-1">
                  <PrimaryButton type="submit" loading={loading}>
                    Send
                  </PrimaryButton>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm">
              <Link to="/login" className="text-[#6C5CE7] font-medium hover:underline">
                ← Back to Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
