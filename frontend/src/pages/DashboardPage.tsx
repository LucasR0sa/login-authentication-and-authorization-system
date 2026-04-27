import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <span className="w-8 h-8 border-2 border-[#6C5CE7]/30 border-t-[#6C5CE7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 2L14 26M2 14L26 14M4.929 4.929L23.071 23.071M23.071 4.929L4.929 23.071"
                stroke="#6C5CE7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[#6C5CE7] font-semibold text-lg">Nucleus</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Log out
          </button>
        </div>

        <h1 className="text-3xl font-bold text-[#111827] mb-1">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-[#6B7280] text-sm">{user?.email}</p>

        <div className="mt-8 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280]">
            You're successfully authenticated. This is your protected dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
