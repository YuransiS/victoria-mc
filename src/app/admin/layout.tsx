import { cookies } from 'next/headers';
import { verifyToken } from '@/actions/auth';
import Sidebar from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  let role: 'OP' | 'SALES' | 'DEVELOPER' = 'OP';
  let username = '';

  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      role = decoded.role;
      username = decoded.username;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#09090B] text-white font-sans">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar role={role} username={username} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
