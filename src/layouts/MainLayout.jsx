import NavBar from '../components/layout/NavBar';

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      {/* Navigation - Fixed Left Bar */}
      <NavBar />

      {/* Main Content - Full Width */}
      <main className="flex-1 h-full overflow-hidden relative bg-white">
        {children}
      </main>
    </div>
  );
}