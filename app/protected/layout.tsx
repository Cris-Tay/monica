import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/header";
import { DashboardFooter } from "@/components/layout/footer";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Contenido principal */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <DashboardHeader />
        
        {/* Contenido dinámico */}
        <main className="flex-1 p-6">
          {children}
        </main>
        
        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
}