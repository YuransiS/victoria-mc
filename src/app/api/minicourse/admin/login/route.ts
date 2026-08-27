import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';
import { MinicourseUser } from '@/app/minicourse/types';

const ADMIN_CREDENTIALS = [
  { username: 'victoria', role: 'admin', label: 'Адміністратор Owner (Вікторія)', password: 'ndfdfh4#fd' },
  { username: 'sofifinsight', role: 'admin', label: 'Адміністратор Owner', password: 'ndfdfh4#fd' },
  { username: 'yuransis', role: 'admin', label: 'Адміністратор Admin', password: 'fdsjhe35Frgf' },
  { username: 'jeniaproop', role: 'admin', label: 'Адміністратор Admin', password: 'dfaGdxvvg@x3' },
  { username: 'anya-koorator', role: 'admin', label: 'Адміністратор Anya-Koorator', password: 'fh1`lkfdmcwS5' },
];

export async function POST(req: Request) {
  try {
    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json({ success: false, error: 'Будь ласка, заповніть всі поля для входу' }, { status: 400 });
    }

    const inputClean = emailOrUsername.replace(/^@/, '').trim().toLowerCase();
    const passwordClean = password.trim();

    // Match admin credentials
    const adminMatch = ADMIN_CREDENTIALS.find(admin => {
      const matchUsername = admin.username.toLowerCase() === inputClean;
      const matchEmail = `${admin.username.toLowerCase()}@finsight.com` === inputClean;
      return (matchUsername || matchEmail) && admin.password === passwordClean;
    });

    if (!adminMatch) {
      return NextResponse.json({ success: false, error: 'Невірне ім\'я користувача або пароль адміністратора' }, { status: 401 });
    }

    // Prepare profile
    const adminUsername = adminMatch.username;
    const adminEmail = `${adminUsername}@finsight.com`;

    if (!supabase) {
      // Mock Mode Admin Profile
      const mockAdminUser: MinicourseUser = {
        id: `admin-${adminUsername}`,
        name: adminMatch.label,
        email: adminEmail,
        telegram: adminUsername,
        role: 'admin',
        is_paid: true,
        payment_status: 'paid',
        device_uuids: [],
        status: 'active',
        created_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        user: mockAdminUser,
        message: 'Адміністратор успішно авторизований (Mock Mode)'
      });
    } else {
      // Live Supabase Mode
      // Get or create admin user
      let { data: user, error } = await supabase
        .from('minicourse_users')
        .select('*')
        .or(`email.eq.${adminEmail},telegram.eq.${adminUsername}`)
        .maybeSingle();

      if (error) {
        console.error('Supabase fetch admin error:', error);
        return NextResponse.json({ success: false, error: 'Помилка бази даних' }, { status: 500 });
      }

      if (!user) {
        // Create admin user in db
        const { data: newUser, error: createError } = await supabase
          .from('minicourse_users')
          .insert({
            name: adminMatch.label,
            email: adminEmail,
            telegram: adminUsername,
            role: 'admin',
            is_paid: true,
            payment_status: 'paid',
            device_uuids: [],
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          console.error('Supabase create admin error:', createError);
          return NextResponse.json({ success: false, error: 'Не вдалося створити профіль адміністратора' }, { status: 500 });
        }
        user = newUser;
      } else if (user.role !== 'admin') {
        // Update role to admin if they are registered as student but matched admin password
        const { data: updatedUser, error: updateError } = await supabase
          .from('minicourse_users')
          .update({ role: 'admin', is_paid: true, payment_status: 'paid' })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Supabase update admin role error:', updateError);
        } else {
          user = updatedUser;
        }
      }

      return NextResponse.json({
        success: true,
        user: user as MinicourseUser,
        message: 'Адміністратор успішно авторизований'
      });
    }

  } catch (error: any) {
    console.error('Admin secure login route error:', error);
    return NextResponse.json({ success: false, error: 'Сталася помилка на сервері' }, { status: 500 });
  }
}
