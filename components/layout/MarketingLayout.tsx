import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-slate-100">
      <Navbar />
      <main className="relative isolate overflow-hidden">{children}</main>
      <Footer />
    </div>
  );
}
