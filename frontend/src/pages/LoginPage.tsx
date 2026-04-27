import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import GoogleButton from '../components/GoogleButton';
import LeftPanel from '../components/LeftPanel';
import { login } from '../services/api';

interface LocationState {
  success?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as LocationState | null)?.success;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[960px] rounded-2xl shadow-xl overflow-hidden flex" style={{ minHeight: 580 }}>
        <LeftPanel />

        <div className="flex-1 bg-white flex items-center justify-center p-10">
          <div className="w-full max-w-[340px]">
            <h1 className="text-[22px] font-bold text-[#111827] mb-1">Welcome back</h1>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              Automate Processes Operational, Data Analytics, Marketing and Sales, End-to-end Business Intelligence with independent AI agents
            </p>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {successMessage}
              </div>
            )}

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                autoComplete="email"
              />

              <div>
                <InputField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  error={errors.password}
                  autoComplete="current-password"
                />
                <div className="flex justify-end mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#6C5CE7] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-[#111827] font-medium">Remember me</span>
                <button
                  type="button"
                  onClick={() => setRemember(r => !r)}
                  aria-pressed={remember}
                  aria-label="Remember sign in details"
                  className={`relative inline-block w-10 h-6 rounded-full p-0 border-0 shrink-0 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 ${
                    remember ? 'bg-[#6C5CE7]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      remember ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <PrimaryButton type="submit" loading={loading}>
                Log in
              </PrimaryButton>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs text-[#6B7280]">OR</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <GoogleButton />

            <p className="mt-6 text-center text-sm text-[#6B7280]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#6C5CE7] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
