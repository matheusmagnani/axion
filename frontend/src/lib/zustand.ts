// Store global com Zustand (pode ser expandido conforme necessário)
import { create } from 'zustand';

interface AppState {
  // Adicionar estados globais conforme necessário
}

export const useAppStore = create<AppState>(() => ({}));
