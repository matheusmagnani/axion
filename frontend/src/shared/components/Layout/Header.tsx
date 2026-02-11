import { useState, useRef, useEffect } from 'react';
import { Flask, DoorOpen, PencilSimple, CaretUp } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@modules/auth/services/authService';
import { useToast } from '@shared/hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function Header() {
  const [expanded, setExpanded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [user, setUser] = useState(authService.getUser());
  const { addToast } = useToast();

  useEffect(() => {
    function calc() {
      const barH = headerBarRef.current?.offsetHeight || 0;
      setExpandedHeight(window.innerHeight - barH);
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const company = user?.company;
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setEditing(false);
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    authService.logout();
    window.location.href = '/login';
  }

  function startEditing() {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditing(true);
    setAvatarMenuOpen(false);
  }

  function cancelEditing() {
    setEditing(false);
    setAvatarMenuOpen(false);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: editName,
        email: editEmail,
      });
      setUser({ ...user, ...updated });
      setEditing(false);
      addToast('Dados atualizados com sucesso', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || err.message || 'Erro ao salvar', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await authService.uploadAvatar(file);
      setAvatarUrl(`${API_URL}/uploads/${result.avatar}`);
      setUser({ ...user, avatar: result.avatar });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Erro ao enviar foto';
      addToast(errorMessage, 'danger');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAvatarMenuOpen(false);
  }

  async function handleRemoveAvatar() {
    try {
      await authService.removeAvatar();
      setAvatarUrl(null);
      setUser({ ...user, avatar: null });
    } catch (err: any) {
      addToast(err.message || 'Erro ao remover foto', 'danger');
    }
    setAvatarMenuOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative z-40">
      <div ref={headerBarRef}>
        {/* Test Banner */}
        <div className="flex items-center justify-center gap-1 py-[4px] md:py-[5px] px-2 bg-app-secondary">
          <Flask className="w-4 h-4 md:w-5 md:h-5 text-app-primary flex-shrink-0" weight="fill" />
          <p className="text-[10px] md:text-sm lg:text-base leading-[1.23] font-semibold text-app-primary text-center">
            <span className="hidden sm:inline">Ambiente de Testes - Você pode experimentar livremente a aplicação sem risco de alterar dados reais.</span>
            <span className="sm:hidden">Ambiente de Testes</span>
          </p>
        </div>

        {/* Collapsed: compact bar */}
        <div className="bg-app-primary border-l border-app-secondary/30">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          <motion.div
            className="flex items-center justify-between"
            animate={{
              paddingTop: expanded ? 64 : 8,
              paddingBottom: expanded ? 24 : 8,
              paddingLeft: expanded ? 80 : 16,
              paddingRight: expanded ? 80 : 16,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex flex-col items-start">
              {expanded && editing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-transparent border border-app-secondary/50 rounded-lg px-4 py-2 text-app-secondary text-4xl leading-[1.19] font-medium outline-none w-full focus:border-app-secondary transition-colors"
                  placeholder="Nome"
                />
              ) : (
                <motion.p
                  className="leading-[1.19] font-medium text-app-secondary text-left"
                  initial={false}
                  animate={{
                    fontSize: expanded ? '2.25rem' : '1.125rem',
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  {user?.name || 'Usuário'}
                </motion.p>
              )}
              <AnimatePresence mode="wait">
                {!expanded ? (
                  <motion.p
                    key="company"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs md:text-sm leading-[1.16] font-normal text-app-secondary/70 text-left"
                  >
                    {company?.tradeName || company?.companyName || 'Axion'}
                  </motion.p>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-start mt-3"
                  >
                    {editing ? (
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="bg-transparent border border-app-secondary/30 rounded-lg px-4 py-2 text-app-secondary/70 text-base md:text-lg outline-none focus:border-app-secondary/50 transition-colors"
                        placeholder="Email"
                      />
                    ) : (
                      <p className="text-base md:text-lg text-app-secondary/50">
                        Email: {user?.email || '—'}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex-shrink-0">
              <motion.button
                onClick={() => {
                  if (!editing && !expanded) setExpanded(true);
                }}
                className={`rounded-full flex items-center justify-center overflow-hidden cursor-pointer border-0 outline-none p-0 ${
                  avatarUrl ? 'bg-transparent' : 'bg-app-secondary/20 border-2 !border-app-secondary'
                }`}
                animate={{
                  width: expanded ? 96 : 40,
                  height: expanded ? 96 : 40,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <motion.span
                    className="text-app-secondary font-semibold"
                    animate={{ fontSize: expanded ? '1.75rem' : '0.875rem' }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {initials}
                  </motion.span>
                )}
              </motion.button>

              {/* Edit overlay on avatar when in edit mode */}
              {expanded && editing && (
                <button
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-app-secondary rounded-full flex items-center justify-center cursor-pointer border-0 shadow-md"
                >
                  <PencilSimple className="w-4 h-4 text-app-primary" weight="bold" />
                </button>
              )}

              {/* Avatar edit menu */}
              {avatarMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-app-secondary rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px]">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 text-center text-sm text-app-primary hover:bg-black/5 cursor-pointer border-0 bg-transparent"
                  >
                    {avatarUrl ? 'Mudar foto' : 'Adicionar foto'}
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="w-full px-4 py-3 text-center text-sm text-red-600 hover:bg-black/5 cursor-pointer border-0 bg-transparent"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Expanded content */}
      <div className="bg-app-primary border-l border-app-secondary/30">
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: expandedHeight, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden overflow-y-auto"
            >
              <div className="px-[80px] pb-4 md:pb-6">
                {/* Action buttons */}
                <div className="flex gap-3 mb-44">
                  <button
                    onClick={editing ? cancelEditing : startEditing}
                    disabled={saving}
                    className={`px-8 py-3 font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50 ${
                      editing
                        ? 'bg-transparent text-app-secondary border border-app-secondary/50 hover:bg-app-secondary/10 min-w-[120px]'
                        : 'bg-app-secondary text-app-primary hover:brightness-110 border-0'
                    }`}
                  >
                    {editing ? 'Cancelar' : 'Editar dados do usuário'}
                  </button>
                  {editing && (
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="px-8 py-3 bg-app-secondary text-app-primary font-semibold text-sm rounded-lg hover:brightness-110 cursor-pointer border-0 disabled:opacity-50 min-w-[120px]"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  )}
                </div>

                {/* Company info */}
                <div>
                  <h2 className="text-lg md:text-xl font-medium text-app-secondary/70">
                    {company?.tradeName || company?.companyName || 'Empresa'}
                  </h2>
                  <p className="text-xs md:text-sm text-app-secondary/50 mt-1">
                    CNPJ: {company?.cnpj || '—'}
                  </p>
                  <p className="text-xs md:text-sm text-app-secondary/50">
                    Departamento: {company?.department || user?.department || '—'}
                  </p>
                </div>

                {/* Logout */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-app-secondary/70 hover:text-app-secondary transition-colors cursor-pointer bg-transparent border-0 outline-none text-sm md:text-base"
                  >
                    <DoorOpen className="w-5 h-5 md:w-6 md:h-6" />
                    Sair
                  </button>
                </div>

                {/* Collapse button */}
                <div className="flex justify-center mt-32">
                  <button
                    onClick={() => {
                      setExpanded(false);
                      setEditing(false);
                      setAvatarMenuOpen(false);
                    }}
                    className="p-3 rounded-full bg-app-secondary/10 hover:bg-app-secondary/20 transition-colors cursor-pointer border-0 outline-none"
                  >
                    <CaretUp className="w-6 h-6 text-app-secondary" weight="bold" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
