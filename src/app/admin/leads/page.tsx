import { cookies } from 'next/headers';
import { verifyToken } from '@/actions/auth';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { redirect } from 'next/navigation';

export default async function AdminLeadsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  return (
    <AdminDashboardClient 
      role={decoded.role} 
      username={decoded.username} 
      onlyView="leads" 
    />
  );
}
