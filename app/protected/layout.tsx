import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/header";
import { DashboardFooter } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Sidebar - oculto en móviles */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      
      {/* Contenido principal */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <DashboardHeader />
        
        {/* Contenido dinámico */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
        
        {/* Footer - oculto en móviles */}
        <div className="hidden md:block">
          <DashboardFooter />
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}