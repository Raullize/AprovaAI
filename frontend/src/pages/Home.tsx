import React from 'react';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/sections/Hero';
import { Features } from '../components/sections/Features';
import { Pricing } from '../components/sections/Pricing';
import { Footer } from '../components/layout/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
