import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { authService } from '../services/authService';
import { useToast } from '@shared/hooks/useToast';

type View = 'login' | 'register';
type RegStep = 'user' | 'company';

const DEPARTMENTS = [
  'Tecnologia',
  'Marketing',
  'Financeiro',
  'Recursos Humanos',
  'Comercial',
  'Jurídico',
  'Operações',
  'Logística',
  'Outros',
];

const inputClass =
  'w-full px-4 py-3 bg-transparent border border-app-secondary/30 rounded-lg text-app-secondary placeholder-app-secondary/30 focus:outline-none focus:border-app-secondary/60 transition-colors';

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [view, setView] = useState<View>('login');
  const [transitioning, setTransitioning] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Register state
  const [regStep, setRegStep] = useState<RegStep>('user');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [department, setDepartment] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  function switchView(to: View) {
    if (transitioning) return;
    setTransitioning(true);
    setContentVisible(false);
    setView(to);
    if (to === 'register') setRegStep('user');

    setTimeout(() => {
      setContentVisible(true);
      setTransitioning(false);
    }, 1000);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(email, password);
      queryClient.clear();
      navigate('/associates');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao fazer login', 'danger');
    } finally {
      setLoading(false);
    }
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      addToast('As senhas não coincidem', 'danger');
      return;
    }
    setRegStep('company');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    try {
      await authService.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        companyName,
        tradeName: tradeName || undefined,
        cnpj,
        department: department || undefined,
      });
      addToast('Conta criada com sucesso!', 'success');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setCompanyName('');
      setTradeName('');
      setCnpj('');
      setDepartment('');
      switchView('login');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao cadastrar', 'danger');
    } finally {
      setRegLoading(false);
    }
  }

  const isLogin = view === 'login';

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-app-primary flex">
      {/* Diagonal background overlay */}
      <div
        className="absolute bg-app-bg transition-transform duration-1000 ease-in-out"
        style={{
          width: '300%',
          height: '300%',
          top: '-100%',
          left: '-100%',
          clipPath: 'polygon(0 0, 65% 0, 32% 100%, 0 100%)',
          transformOrigin: '50% 50%',
          transform: isLogin ? 'rotate(0deg)' : 'rotate(180deg)',
        }}
      />

      {/* Left side — branding (login) */}
      <div
        className={`relative z-10 hidden lg:flex flex-col justify-center items-start w-1/2 px-16 xl:px-24 pb-48 transition-opacity duration-400 ${
          isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center">
          <img src="/axion-logo.png" alt="Axion" className="w-72 xl:w-96" />
          <img src="/axion-icon.png" alt="Axion icon" className="mt-6 w-20 h-20 rounded-xl" />
        </div>
      </div>

      {/* Right side — login form */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-6 sm:px-12 lg:pl-[50%] transition-opacity duration-400 ${
          isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="lg:hidden mb-10 text-center">
          <img src="/axion-logo.png" alt="Axion" className="w-48 mx-auto" />
          <img src="/axion-icon.png" alt="Axion icon" className="mt-4 mx-auto w-12 h-12 rounded-xl" />
        </div>

        <div className="w-full max-w-sm">
          <p className="text-app-secondary/70 text-base mb-8 text-center">
            Faça login para continuar
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-app-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@email.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-app-secondary mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*******"
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/40 hover:text-app-secondary transition-colors"
                >
                  {showLoginPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-app-secondary text-app-primary font-semibold rounded-lg hover:bg-app-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-app-secondary/60 mt-4">
              <button
                type="button"
                onClick={() => switchView('register')}
                className="text-app-secondary hover:underline transition-colors"
              >
                Ainda não tenho uma conta
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right side — branding (register) */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-10 hidden lg:flex flex-col justify-center items-center w-1/2 px-16 xl:px-24 pb-48 transition-opacity duration-400 ${
          !isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center">
          <img src="/axion-logo.png" alt="Axion" className="w-72 xl:w-96" />
          <img src="/axion-icon.png" alt="Axion icon" className="mt-6 w-20 h-20 rounded-xl" />
        </div>
      </div>

      {/* Left side — register form */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-6 sm:px-12 lg:pr-[50%] transition-opacity duration-400 ${
          !isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="lg:hidden mb-10 text-center">
          <img src="/axion-logo.png" alt="Axion" className="w-48 mx-auto" />
          <img src="/axion-icon.png" alt="Axion icon" className="mt-4 mx-auto w-12 h-12 rounded-xl" />
        </div>

        <div className="w-full max-w-sm">
          <div className="flex items-center gap-4 px-4 py-3 mb-6 rounded-lg bg-app-secondary/10 border border-app-secondary/20">
            <span className="text-app-secondary text-xs font-semibold whitespace-nowrap">BETA</span>
            <p className="text-app-secondary/60 text-xs leading-tight">
              Aplicação em fase de testes. Os dados podem ser redefinidos a qualquer momento.
            </p>
          </div>

          <p className="text-app-secondary/70 text-base mb-8 text-center">
            Crie sua conta
          </p>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRegStep('user')}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                regStep === 'user'
                  ? 'bg-app-secondary text-app-primary'
                  : 'bg-app-secondary/10 text-app-secondary/50'
              }`}
            >
              1. Usuário
            </button>
            <div className="w-6 h-px bg-app-secondary/30" />
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                regStep === 'company'
                  ? 'bg-app-secondary text-app-primary'
                  : 'bg-app-secondary/10 text-app-secondary/50'
              }`}
            >
              2. Empresa
            </span>
          </div>

          {/* Step 1: User info */}
          {regStep === 'user' && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-app-secondary mb-2">
                  Nome
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-app-secondary mb-2">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seuemail@email.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-app-secondary mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="*******"
                    required
                    minLength={6}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/40 hover:text-app-secondary transition-colors"
                  >
                    {showRegPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-app-secondary mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="*******"
                    required
                    minLength={6}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/40 hover:text-app-secondary transition-colors"
                  >
                    {showRegConfirmPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-app-secondary text-app-primary font-semibold rounded-lg hover:bg-app-secondary/90 transition-colors"
              >
                Próximo
              </button>

              <p className="text-center text-sm text-app-secondary/60 mt-4">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-app-secondary hover:underline transition-colors"
                >
                  Já tenho uma conta
                </button>
              </p>
            </form>
          )}

          {/* Step 2: Company info */}
          {regStep === 'company' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-app-secondary mb-2">
                  Razão Social
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Empresa Ltda"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="trade-name" className="block text-sm font-medium text-app-secondary mb-2">
                  Nome Fantasia
                </label>
                <input
                  id="trade-name"
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Nome Fantasia"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cnpj" className="block text-sm font-medium text-app-secondary mb-2">
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-app-secondary mb-2">
                  Departamento
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className={`${inputClass} ${!department ? 'text-app-secondary/30' : ''}`}
                >
                  <option value="" disabled>Selecione um departamento</option>
                  {DEPARTMENTS.map((dep) => (
                    <option key={dep} value={dep} className="bg-app-primary text-app-secondary">
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRegStep('user')}
                  className="flex-1 py-3 border border-app-secondary/30 text-app-secondary font-semibold rounded-lg hover:bg-app-secondary/10 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex-1 py-3 bg-app-secondary text-app-primary font-semibold rounded-lg hover:bg-app-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>

              <p className="text-center text-sm text-app-secondary/60 mt-4">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-app-secondary hover:underline transition-colors"
                >
                  Já tenho uma conta
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
