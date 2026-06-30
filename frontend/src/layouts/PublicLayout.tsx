import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/shared/Logo';
import { useThemeStore } from '../store/useThemeStore';

export const PublicLayout: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background-base text-on-surface flex flex-col font-body-md antialiased selection:bg-primary/30">
      {/* Landing Page Header */}
      <header className="flex justify-between items-center px-page-margin-desktop w-full sticky top-0 z-40 bg-background-base/80 backdrop-blur-md border-b border-border-subtle h-16 transition-premium">
        <div className="flex items-center gap-stack-lg">
          <Link to="/">
            <Logo hideText={false} />
          </Link>
          <nav className="hidden md:flex items-center gap-stack-lg ml-stack-lg">
            <a className="text-primary font-bold border-b-2 border-primary py-stack-xs cursor-pointer transition-premium" href="#platform">Platform</a>
            <a className="text-text-muted hover:bg-surface-variant/50 transition-premium px-stack-sm rounded-lg py-1 cursor-pointer" href="#solutions">Solutions</a>
            <a className="text-text-muted hover:bg-surface-variant/50 transition-premium px-stack-sm rounded-lg py-1 cursor-pointer" href="#security">Security</a>
            <a className="text-text-muted hover:bg-surface-variant/50 transition-premium px-stack-sm rounded-lg py-1 cursor-pointer" href="#pricing">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-stack-md">
          <Link
            to="/dashboard"
            className="hidden md:block bg-primary text-on-primary font-label-md text-label-md px-stack-lg py-2 rounded-lg cursor-pointer transition-premium btn-hover-effect flex items-center justify-center font-bold text-center"
          >
            Launch Console
          </Link>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-background-base border-t border-border-subtle pt-20 pb-10 px-page-margin-desktop transition-premium">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter mb-20">
          <div className="md:col-span-4 space-y-stack-lg">
            <Logo />
            <p className="text-text-muted max-w-xs mt-4">
              Building the future of autonomous insurance verification with ethical AI and precision engineering.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">Platform</h4>
            <nav className="flex flex-col gap-2">
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">Fraud Detection</a>
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">Vision API</a>
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">Enterprise Portal</a>
            </nav>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">Company</h4>
            <nav className="flex flex-col gap-2">
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">About Us</a>
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">Careers</a>
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">Blog</a>
            </nav>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">Resources</h4>
            <nav className="flex flex-col gap-2">
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">API Documentation</a>
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">Legal &amp; Privacy</a>
              <a className="text-text-muted hover:text-on-surface transition-premium text-sm" href="#">System Status</a>
            </nav>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">Join the Alpha</h4>
            <div className="flex flex-col gap-4">
              <input
                className="bg-surface-dim border border-border-subtle rounded-lg px-4 py-2 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-premium"
                placeholder="Email address"
                type="email"
              />
              <button className="bg-primary text-on-primary text-label-sm font-bold py-2 rounded-lg transition-premium btn-hover-effect cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-stack-md text-label-sm text-text-muted uppercase tracking-widest">
          <p className="text-xs">© 2024 ClaimIQ AI Technologies Inc.</p>
          <p className="text-xs">ISO 27001 Certified • SOC2 Type II</p>
        </div>
      </footer>
    </div>
  );
};
