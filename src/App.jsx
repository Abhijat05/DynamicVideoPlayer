import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PlayerSection from '@/components/player/PlayerSection';
import LibrarySection from '@/components/library/LibrarySection';
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <PlayerSection />
        <LibrarySection />
      </div>
      <Toaster />
    </MainLayout>
  );
};

export default App;