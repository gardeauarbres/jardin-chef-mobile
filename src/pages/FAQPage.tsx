import { FAQ } from '@/components/FAQ';
import MobileNav from '@/components/MobileNav';

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <p className="text-sm opacity-90">Aide & Questions fréquentes</p>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        <FAQ />
      </main>

      <MobileNav />
    </div>
  );
};

export default FAQPage;

