import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import GoogleButton from '../components/GoogleButton';
import LeftPanel from '../components/LeftPanel';
import { register } from '../services/api';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormState) {
    return (v: string) => setForm(f => ({ ...f, [field]: v }));
  }

  function validate(): Partial<FormState> {
    const errs: Partial<FormState> = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    if (!form.confirm) errs.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
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
      await register(form.name, form.email, form.password);
      navigate('/login', { state: { success: 'Account created! Please log in.' } });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed');
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
            <h1 className="text-[22px] font-bold text-[#111827] mb-1">Create your account</h1>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              Join Caslu and start Automate Processes.
            </p>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <InputField
                label="Name"
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                autoComplete="name"
              />
              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
              />
              <InputField
                label="Password with 8 characters, uppercase, lowercase and a number"
                type="password"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                autoComplete="new-password"
              />
              <InputField
                label="Password with 8 characters, uppercase, lowercase and a number"
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                error={errors.confirm}
                autoComplete="new-password"
              />
              <div className="pt-1">
                <PrimaryButton type="submit" loading={loading}>
                  Create account
                </PrimaryButton>
              </div>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs text-[#6B7280]">OR</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <GoogleButton />

            <p className="mt-6 text-center text-sm text-[#6B7280]">
              Have an account?{' '}
              <Link to="/login" className="text-[#6C5CE7] font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
