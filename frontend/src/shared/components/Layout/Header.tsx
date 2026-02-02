import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flask, SignOut, Camera, Trash } from '@phosphor-icons/react';
import { authService } from '@modules/auth/services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = authService.getUser();
  const PREPOSITIONS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  const initials = user?.name
    ? user.name.split(' ').filter((n: string) => !PREPOSITIONS.has(n.toLowerCase())).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(`${API_URL}/uploads/${user.avatar}`);
    } else {
      setAvatarUrl(null);
    }
  }, [user?.avatar]);

  function handleLogout() {
    authService.logout();
    window.location.href = '/login';
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await authService.uploadAvatar(file);
      setAvatarUrl(`${API_URL}/uploads/${result.avatar}`);
      setMenuOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar foto');
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleAvatarRemove() {
    try {
      await authService.removeAvatar();
      setAvatarUrl(null);
      setMenuOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover foto');
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-0 w-full">
      {/* Test Banner */}
      <div className="flex items-center justify-center gap-1 py-[4px] md:py-[5px] px-2 bg-app-secondary">
        <Flask className="w-4 h-4 md:w-5 md:h-5 text-app-primary flex-shrink-0" weight="fill" />
        <p className="text-[10px] md:text-sm lg:text-base leading-[1.23] font-semibold text-app-primary text-center">
          <span className="hidden sm:inline">Ambiente de Testes - Você pode experimentar livremente a aplicação sem risco de alterar dados reais.</span>
          <span className="sm:hidden">Ambiente de Testes</span>
        </p>
      </div>

      {/* User Profile */}
      <div className="flex items-center justify-between px-4 md:px-[33px] py-2 md:py-[10px] bg-app-primary">
        {/* Name and Company - Left */}
        <div className="flex flex-col justify-center items-start font-sans">
          <p className="text-base md:text-xl lg:text-2xl leading-[1.19] font-medium text-app-secondary text-left">
            {user?.name || 'Usuário'}
          </p>
          <p className="text-xs md:text-sm lg:text-base leading-[1.16] font-normal text-app-secondary/70 text-left">
            {user?.company?.tradeName || user?.company?.companyName || 'Axion'}
          </p>
        </div>
        {/* Avatar - Right */}
        <div className="relative" ref={menuRef}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`w-10 h-10 md:w-14 md:h-14 lg:w-[60px] lg:h-[60px] rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors overflow-hidden outline-none border-0 p-0 ${avatarUrl ? 'bg-transparent hover:opacity-80' : 'bg-app-secondary/20 border-2 !border-app-secondary hover:bg-app-secondary/30'}`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-app-secondary font-semibold text-sm md:text-lg lg:text-xl">
                {initials}
              </span>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-app-primary border border-app-secondary/20 rounded-lg shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-app-secondary hover:bg-app-secondary/10 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Trocar foto
              </button>
              {avatarUrl && (
                <button
                  onClick={handleAvatarRemove}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-app-secondary hover:bg-app-secondary/10 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  Remover foto
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-app-secondary hover:bg-app-secondary/10 transition-colors"
              >
                <SignOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
