import { useCallback, useEffect, useState } from 'react';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { DashboardShell } from './components/DashboardShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { NetworkGuard } from './components/NetworkGuard';
import { PopupAlerts } from './components/PopupAlerts';
import { TradeStoreProvider, useTradeStore } from './context/TradeStoreContext';
import { AboutPage } from './pages/AboutPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AuthPage } from './pages/AuthPage';
import { ContactPage } from './pages/ContactPage';
import { DeliveryTrackerPage } from './pages/DeliveryTrackerPage';
import { LandingPage } from './pages/LandingPage';
import { LiveBidsPage } from './pages/LiveBidsPage';
import { LotDetailPage } from './pages/LotDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { TermsPage } from './pages/TermsPage';
import {
  TraderDashboardPage,
  type AdminSection,
} from './pages/TraderDashboardPage';
import { UserDashboardPage, type UserSection } from './pages/UserDashboardPage';

function getCurrentUrl(): string {
  return `${window.location.pathname || '/'}${window.location.search || ''}`;
}

function isProtectedPath(path: string): boolean {
  return (
    path.startsWith('/admin/') ||
    path === '/admin' ||
    path.startsWith('/dashboard') ||
    path.startsWith('/lots') ||
    path === '/tracker' ||
    path === '/profile'
  );
}

function AppShell() {
  const [url, setUrl] = useState<string>(() => getCurrentUrl());
  const { role, showToast } = useTradeStore();

  useEffect(() => {
    const onPopState = () => {
      setUrl(getCurrentUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback(
    (nextUrl: string) => {
      if (nextUrl !== url) {
        window.history.pushState({}, '', nextUrl);
        setUrl(nextUrl);
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [url]
  );

  const [path] = url.split('?');

  // Role-based route guards
  useEffect(() => {
    if (path === '/admin' || path.startsWith('/admin/')) {
      if (role === 'guest') {
        showToast('Sign in on Admin Desk Login to access admin tools.', 'info');
        navigate('/admin-login');
      } else if (role === 'user') {
        showToast('Admin privileges required for /admin.', 'error');
        navigate('/dashboard');
      }
    } else if (
      (path.startsWith('/dashboard') ||
        path.startsWith('/lots') ||
        path === '/tracker' ||
        path === '/profile') &&
      role === 'guest'
    ) {
      showToast('Sign in or register as a vendor to continue.', 'info');
      navigate('/auth');
    } else if ((path === '/auth' || path === '/admin-login') && role !== 'guest') {
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate, path, role, showToast]);

  // Protected Dashboard Routes -> Animated Collapsible Sidebar + Minimal Top Navbar
  if (isProtectedPath(path) && role !== 'guest') {
    let content: React.ReactNode = <NotFoundPage onNavigate={navigate} />;

    if (path === '/admin' || path.startsWith('/admin/')) {
      if (role !== 'admin') {
        content = <UserDashboardPage section="overview" onNavigate={navigate} />;
      } else {
        let adminSection: AdminSection | null = null;
        if (path === '/admin') adminSection = 'overview';
        else if (path === '/admin/create') adminSection = 'create';
        else if (path === '/admin/lots') adminSection = 'lots';
        else if (path === '/admin/deals') adminSection = 'deals';
        else if (path === '/admin/shipping') adminSection = 'shipping';
        else if (path === '/admin/site') adminSection = 'site';

        content = adminSection ? (
          <TraderDashboardPage section={adminSection} onNavigate={navigate} />
        ) : (
          <NotFoundPage onNavigate={navigate} />
        );
      }
    } else if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      if (path === '/dashboard') {
        content = <UserDashboardPage section="overview" onNavigate={navigate} />;
      } else if (path === '/dashboard/deals') {
        content = <UserDashboardPage section="deals" onNavigate={navigate} />;
      } else if (path === '/dashboard/notifications') {
        content = <UserDashboardPage section="notifications" onNavigate={navigate} />;
      }
    } else if (path === '/lots') {
      content = <LiveBidsPage onNavigate={navigate} />;
    } else if (path.startsWith('/lots/')) {
      const lotId = decodeURIComponent(path.replace('/lots/', ''));
      content = <LotDetailPage lotId={lotId} onNavigate={navigate} />;
    } else if (path === '/tracker') {
      content = <DeliveryTrackerPage onNavigate={navigate} />;
    } else if (path === '/profile') {
      content = <ProfilePage onNavigate={navigate} />;
    }

    return (
      <>
        <DashboardShell route={path} onNavigate={navigate}>
          {content}
        </DashboardShell>
        <PopupAlerts />
        <CelebrationOverlay />
      </>
    );
  }

  // Public Pages (Home, About, Contact, Terms, Vendor Auth, Admin Login, 404)
  let publicPage: React.ReactNode = null;
  if (path === '/' || path === '') {
    publicPage = <LandingPage onNavigate={navigate} />;
  } else if (path === '/about') {
    publicPage = <AboutPage onNavigate={navigate} />;
  } else if (path === '/contact') {
    publicPage = <ContactPage />;
  } else if (path === '/terms') {
    publicPage = <TermsPage onNavigate={navigate} />;
  } else if (path === '/auth') {
    publicPage = <AuthPage onNavigate={navigate} />;
  } else if (path === '/admin-login') {
    publicPage = <AdminLoginPage onNavigate={navigate} />;
  } else if (isProtectedPath(path)) {
    publicPage =
      path === '/admin' || path.startsWith('/admin/') ? (
        <AdminLoginPage onNavigate={navigate} />
      ) : (
        <AuthPage onNavigate={navigate} />
      );
  } else {
    publicPage = <NotFoundPage onNavigate={navigate} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header route={path} onNavigate={navigate} />
      <main style={{ flex: 1 }}>{publicPage}</main>
      <Footer onNavigate={navigate} />
      <PopupAlerts />
      <CelebrationOverlay />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TradeStoreProvider>
        <NetworkGuard>
          <AppShell />
        </NetworkGuard>
      </TradeStoreProvider>
    </ErrorBoundary>
  );
}
