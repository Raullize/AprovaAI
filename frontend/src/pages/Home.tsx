import { Header } from '../components/layout/Header';
import { Hero } from '../components/sections/Hero';
import { Features } from '../components/sections/Features';
import { Pricing } from '../components/sections/Pricing';
import { Footer as AppFooter } from '../components/layout/AppFooter';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Pricing />
      </main>
      <AppFooter />
    </div>
  );
}
