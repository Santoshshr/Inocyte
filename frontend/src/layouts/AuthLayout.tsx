import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/Inocyte_Admin_Panel" replace />;
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-dark relative flex-col justify-between p-12 overflow-hidden">
        {/* Subtle background glow/shapes using brand colors */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-primary opacity-20 blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[0%] w-[60%] h-[60%] rounded-full bg-brand-secondary opacity-10 blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-brand-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">I</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-widest">INOCYTE</span>
        </div>
        
        <div className="relative z-10 mb-20">
          <h2 className="text-4xl lg:text-5xl font-heading font-semibold text-white mb-6 leading-tight">
            Advanced medical<br/>technology management.
          </h2>
          <p className="text-gray-300 text-lg max-w-md leading-relaxed">
            Securely access your administrative dashboard to manage clinical data, track inquiries, and oversee company operations.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 lg:bg-white shadow-inner lg:shadow-none">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden mb-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-brand-primary flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/30">
              <span className="text-white font-bold text-2xl leading-none">I</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-dark tracking-widest">INOCYTE</h1>
          </div>
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-gray-900 font-heading">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Please enter your credentials to continue.</p>
          </div>
          
          <div className="bg-white lg:bg-transparent py-8 px-6 lg:p-0 shadow-sm sm:rounded-xl sm:px-10 lg:shadow-none lg:rounded-none border border-gray-100 lg:border-none">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
