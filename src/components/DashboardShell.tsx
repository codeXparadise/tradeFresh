import { useState } from 'react';
import {
  Bell,
  Boxes,
  CheckCheck,
  ExternalLink,
  Gavel,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusSquare,
  SlidersHorizontal,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useTradeStore } from '../context/TradeStoreContext';
import { formatTimestamp } from '../utils/format';
import { ThemeSliderToggle } from './ThemeSliderToggle';

interface DashboardShellProps {
  route: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

interface SidebarLink {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export function DashboardShell({
  route,
  onNavigate,
  children,
}: DashboardShellProps) {
  const {
    user,
    role,
    theme,
    toggleTheme,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    signOut,
  } = useTradeStore();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const adminLinks: SidebarLink[] = [
    {
      label: 'Overview',
      path: '/admin',
      icon: <LayoutDashboard size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Create Ask Order',
      path: '/admin/create',
      icon: <PlusSquare size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Manage Lots',
      path: '/admin/lots',
      icon: <Boxes size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Deals',
      path: '/admin/deals',
      icon: <Handshake size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Shipping',
      path: '/admin/shipping',
      icon: <Truck size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Site Controls',
      path: '/admin/site',
      icon: <SlidersHorizontal size={18} strokeWidth={1.75} />,
    },
  ];

  const userLinks: SidebarLink[] = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Live Lots',
      path: '/lots',
      icon: <Gavel size={18} strokeWidth={1.75} />,
    },
    {
      label: 'My Deals',
      path: '/dashboard/deals',
      icon: <Handshake size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Shipping',
      path: '/tracker',
      icon: <Truck size={18} strokeWidth={1.75} />,
    },
    {
      label: 'Notifications',
      path: '/dashboard/notifications',
      icon: <Bell size={18} strokeWidth={1.75} />,
    },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  const go = (path: string) => {
    setMobileDrawer(false);
    setNotifOpen(false);
    setProfileOpen(false);
    onNavigate(path);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr',
        backgroundColor: 'var(--tf-bg)',
      }}
      className={`tf-app-frame ${collapsed ? 'tf-sidebar-collapsed' : ''}`}
    >
      {/* Desktop Collapsible Sidebar */}
      <aside
        aria-label="Workspace navigation"
        className="tf-desktop-sidebar"
        style={{
          backgroundColor: 'var(--tf-surface)',
          borderRight: '1px solid var(--tf-border)',
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div>
          <div
            style={{
              minHeight: '64px',
              paddingInline: collapsed ? '12px' : '18px',
              borderBottom: '1px solid var(--tf-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: '8px',
            }}
          >
            {!collapsed ? (
              <button
                type="button"
                onClick={() => go(role === 'admin' ? '/admin' : '/dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--tf-ink)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--tf-primary)',
                  }}
                />
                <span className="tf-heading-font" style={{ fontSize: '19px', fontWeight: 600 }}>
                  Trade Fresh
                </span>
              </button>
            ) : (
              <span
                aria-hidden="true"
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--tf-primary)',
                }}
              />
            )}
          </div>

          <nav style={{ padding: '14px 10px', display: 'grid', gap: '4px' }}>
            {links.map((item) => {
              const active =
                route === item.path ||
                (item.path === '/lots' && route.startsWith('/lots/'));
              return (
                <button
                  key={item.path}
                  type="button"
                  title={item.label}
                  onClick={() => go(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '12px',
                    minHeight: '44px',
                    paddingInline: collapsed ? '0' : '12px',
                    borderRadius: 'var(--tf-radius)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? 'var(--tf-sage)' : 'transparent',
                    color: active ? 'var(--tf-primary)' : 'var(--tf-ink)',
                  }}
                >
                  {item.icon}
                  {!collapsed ? <span>{item.label}</span> : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--tf-border)' }}>
          <button
            type="button"
            onClick={() => go('/')}
            title="Public site"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '12px',
              minHeight: '44px',
              paddingInline: collapsed ? '0' : '12px',
              borderRadius: 'var(--tf-radius)',
              border: 'none',
              background: 'transparent',
              color: 'var(--tf-muted)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <ExternalLink size={17} strokeWidth={1.75} />
            {!collapsed ? <span>Public homepage</span> : null}
          </button>
        </div>
      </aside>

      {/* Main Column: Minimal Top Navbar + Workspace Canvas */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 35,
            minHeight: '64px',
            paddingInline: '16px',
            backgroundColor: 'var(--tf-surface)',
            borderBottom: '1px solid var(--tf-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="tf-btn tf-btn-secondary tf-desktop-collapse-btn"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((p) => !p)}
              style={{ width: '44px', padding: 0, display: 'none' }}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <button
              type="button"
              className="tf-btn tf-btn-secondary tf-mobile-drawer-btn"
              aria-label="Open sidebar menu"
              onClick={() => setMobileDrawer(true)}
              style={{ width: '44px', padding: 0 }}
            >
              <Menu size={18} />
            </button>

            <span className="tf-label">
              {role === 'admin' ? 'Admin Desk' : 'Vendor Desk'}
            </span>
          </div>

          {/* Right side: ONLY Notification icon, Dark mode toggle, and Profile badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setProfileOpen(false);
                }}
                className="tf-btn tf-btn-secondary"
                style={{ width: '44px', padding: 0, position: 'relative' }}
              >
                <Bell size={18} strokeWidth={1.75} />
                {unreadCount > 0 ? (
                  <span
                    className="tf-tabular"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      minWidth: '16px',
                      height: '16px',
                      paddingInline: '4px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--tf-live)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div
                  className="tf-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '320px',
                    maxWidth: 'calc(100vw - 32px)',
                    zIndex: 50,
                    boxShadow: 'var(--shadow-high)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--tf-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => void markAllNotificationsRead()}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--tf-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCheck size={14} />
                      Mark read
                    </button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ margin: 0, padding: '16px', fontSize: '13px', color: 'var(--tf-muted)' }}>
                        No alerts yet.
                      </p>
                    ) : (
                      notifications.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: '12px 14px',
                            borderBottom: '1px solid var(--tf-border)',
                            backgroundColor: item.isRead
                              ? 'transparent'
                              : 'var(--tf-sage)',
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--tf-muted)', marginTop: '2px' }}>
                            {item.body}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--tf-muted)', marginTop: '4px' }}>
                            {formatTimestamp(item.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Dark Mode Slider Toggle */}
            <ThemeSliderToggle theme={theme} onToggle={toggleTheme} />

            {/* Profile Badge */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((p) => !p);
                  setNotifOpen(false);
                }}
                className="tf-btn tf-btn-secondary"
                style={{ paddingInline: '12px', gap: '8px' }}
              >
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--tf-primary)',
                    color: 'var(--tf-on-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {(user?.displayName || user?.email || 'U').slice(0, 1).toUpperCase()}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {role === 'admin' ? 'Admin' : user?.vendorCode || 'Vendor'}
                </span>
              </button>

              {profileOpen ? (
                <div
                  className="tf-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '240px',
                    zIndex: 50,
                    padding: '14px',
                    display: 'grid',
                    gap: '10px',
                    boxShadow: 'var(--shadow-high)',
                  }}
                >
                  <div style={{ borderBottom: '1px solid var(--tf-border)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px' }}>
                      <User size={14} />
                      {user?.displayName || 'Account'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--tf-muted)', marginTop: '2px' }}>
                      {user?.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => go('/profile')}
                    className="tf-btn tf-btn-secondary"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <User size={16} />
                    Account & Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void signOut();
                      go('/');
                    }}
                    className="tf-btn tf-btn-secondary"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px 16px' }} className="tf-dash-main">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawer ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
          }}
        >
          <div
            style={{
              width: '272px',
              height: '100%',
              backgroundColor: 'var(--tf-surface)',
              borderRight: '1px solid var(--tf-border)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '14px',
                  borderBottom: '1px solid var(--tf-border)',
                }}
              >
                <span className="tf-heading-font" style={{ fontSize: '20px', fontWeight: 600 }}>
                  Trade Fresh
                </span>
                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={() => setMobileDrawer(false)}
                  className="tf-btn tf-btn-ghost"
                  style={{ padding: 0, width: '40px' }}
                >
                  <X size={18} />
                </button>
              </div>
              <nav style={{ display: 'grid', gap: '6px', marginTop: '14px' }}>
                {links.map((item) => {
                  const active = route === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => go(item.path)}
                      className="tf-btn tf-btn-ghost"
                      style={{
                        justifyContent: 'flex-start',
                        backgroundColor: active ? 'var(--tf-sage)' : 'transparent',
                        color: active ? 'var(--tf-primary)' : 'var(--tf-ink)',
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <button
              type="button"
              onClick={() => go('/')}
              className="tf-btn tf-btn-secondary"
              style={{ justifyContent: 'flex-start' }}
            >
              <ExternalLink size={16} />
              Public homepage
            </button>
          </div>
        </div>
      ) : null}

      <style>{`
        .tf-desktop-sidebar {
          overflow: hidden;
          transition: width 260ms cubic-bezier(0.22, 1, 0.36, 1), padding 260ms ease;
        }
        @media (min-width: 960px) {
          .tf-app-frame {
            grid-template-columns: 248px 1fr !important;
            transition: grid-template-columns 260ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .tf-app-frame.tf-sidebar-collapsed {
            grid-template-columns: 72px 1fr !important;
          }
          .tf-desktop-sidebar {
            display: flex !important;
          }
          .tf-desktop-collapse-btn {
            display: inline-flex !important;
          }
          .tf-mobile-drawer-btn {
            display: none !important;
          }
          .tf-dash-main {
            padding: 28px 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
