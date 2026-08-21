'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MinicourseUser, MinicourseProgress } from './types';
import { getProfile, getProgress, syncProgressStates } from './actions';

export function useAuth(requireAdmin = false) {
  const [user, setUser] = useState<MinicourseUser | null>(null);
  const [progress, setProgress] = useState<MinicourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshState = async (userId: string) => {
    try {
      const u = await getProfile(userId);
      const p = await syncProgressStates(userId, u || undefined);
      if (u) {
        setUser(u);
        // Save back updated user to session
        localStorage.setItem('minicourse_session', JSON.stringify(u));
      }
      if (p) {
        setProgress(p);
      }
    } catch (err) {
      console.error("Error refreshing minicourse auth state:", err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const sessionStr = localStorage.getItem('minicourse_session');
      
      const isAdminRoute = pathname.startsWith('/minicourse/admin');
      const isLoginRoute = pathname === '/minicourse/login' || pathname === '/minicourse/admin/login';

      if (!sessionStr) {
        // If not on login page, redirect to correct login page with query params preserved
        if (!isLoginRoute) {
          const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
          if (!searchParams.has('redirect') && pathname !== '/minicourse') {
            searchParams.set('redirect', pathname);
          }
          const searchStr = searchParams.toString();
          const querySuffix = searchStr ? `?${searchStr}` : '';
          
          if (isAdminRoute) {
            router.push(`/minicourse/admin/login${querySuffix}`);
          } else {
            router.push(`/minicourse/login${querySuffix}`);
          }
        } else {
          setLoading(false);
        }
        return;
      }

      try {
        const sessionUser = JSON.parse(sessionStr) as MinicourseUser;
        
        // Admin authorization check
        if (requireAdmin && sessionUser.role !== 'admin') {
          router.push('/minicourse');
          return;
        }

        // Fetch fresh profile and progress from Database/LocalStorage
        const freshUser = await getProfile(sessionUser.id);
        const freshProgress = await syncProgressStates(sessionUser.id, freshUser || undefined);

        if (!freshUser) {
          // Session stale or deleted
          localStorage.removeItem('minicourse_session');
          if (isAdminRoute) {
            router.push('/minicourse/admin/login');
          } else {
            router.push('/minicourse/login');
          }
          return;
        }

        // Student access verification
        if (freshUser.role === 'student') {
          if (!freshUser.is_paid) {
            localStorage.removeItem('minicourse_session');
            router.push('/minicourse/login?warning=unpaid');
            return;
          }
          if (freshUser.status === 'under_investigation') {
            localStorage.removeItem('minicourse_session');
            router.push('/minicourse/login?warning=blocked');
            return;
          }
          
          // Enforce 14-day limit
          const accessStart = freshUser.access_opened_at || freshUser.created_at;
          const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
          if (elapsedDays > 14) {
            localStorage.removeItem('minicourse_session');
            router.push('/minicourse/login?warning=expired');
            return;
          }
        }

        setUser(freshUser);
        if (freshProgress) {
          setProgress(freshProgress);
        }

        // If logged in user is trying to access login page, redirect to dashboard
        if (isLoginRoute) {
          if (freshUser.role === 'admin') {
            router.push('/minicourse/admin');
          } else {
            router.push('/minicourse');
          }
        }
      } catch (err) {
        console.error("Failed to parse minicourse session:", err);
        localStorage.removeItem('minicourse_session');
        if (isAdminRoute) {
          router.push('/minicourse/admin/login');
        } else {
          router.push('/minicourse/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, requireAdmin]);

  const login = (userData: MinicourseUser, userProgress?: MinicourseProgress) => {
    localStorage.setItem('minicourse_session', JSON.stringify(userData));
    setUser(userData);
    if (userProgress) {
      setProgress(userProgress);
    }
    if (userData.role === 'admin') {
      router.push('/minicourse/admin');
    } else {
      router.push('/minicourse');
    }
  };

  const logout = () => {
    localStorage.removeItem('minicourse_session');
    setUser(null);
    setProgress(null);
    if (pathname.startsWith('/minicourse/admin')) {
      router.push('/minicourse/admin/login');
    } else {
      router.push('/minicourse/login');
    }
  };

  return {
    user,
    progress,
    loading,
    login,
    logout,
    refreshProgress: () => user && refreshState(user.id)
  };
}
