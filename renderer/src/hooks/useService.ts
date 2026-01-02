import { useContext } from 'react';
import { ServiceContext } from '@/contexts/ServiceContext';

export function useService() {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }

  return context;
}