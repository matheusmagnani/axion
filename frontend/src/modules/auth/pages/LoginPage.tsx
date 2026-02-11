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
  'w-full px-4 py-3 bg-app-primary border border-app-secondary/40 rounded-lg text-app-secondary placeholder-app-secondary/40 focus:outline-none focus:border-app-secondary transition-colors';

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
    }, 800);
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
    <div className="relative min-h-screen w-full overflow-hidden bg-app-bg flex">
      {/* Background blur image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(/auth-blur-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Diagonal dark overlay */}
      <div
        className="absolute bg-app-primary transition-transform duration-1000 ease-in-out z-[5]"
        style={{
          width: '300%',
          height: '300%',
          top: '-100%',
          left: '-100%',
          clipPath: 'polygon(100% 0, 60% 0, 40% 100%, 100% 100%)',
          transformOrigin: '50% 50%',
          transform: isLogin ? 'rotate(0deg)' : 'rotate(180deg)',
        }}
      />

      {/* Golden border line */}
      <div
        className="absolute transition-transform duration-1000 ease-in-out z-[6]"
        style={{
          width: '300%',
          height: '300%',
          top: '-100%',
          left: '-100%',
          clipPath: 'polygon(60% 0, 60.05% 0, 40.05% 100%, 40% 100%)',
          background: 'linear-gradient(to bottom, transparent 25%, var(--color-app-secondary) 40%, var(--color-app-secondary) 60%, transparent 75%)',
          transformOrigin: '50% 50%',
          transform: isLogin ? 'rotate(0deg)' : 'rotate(180deg)',
        }}
      />

      {/* Animated blur balls - RIGHT side (login) */}
      <div
        className={`absolute inset-0 z-[7] overflow-hidden pointer-events-none transition-opacity duration-700 ${
          isLogin ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute w-[150px] h-[150px] rounded-full"
          style={{
            background: 'var(--color-app-accent)',
            filter: 'blur(35px)',
            top: '10%',
            right: '3%',
            animation: 'float1 8s ease-in-out infinite',
            boxShadow: '0 0 80px 40px var(--color-app-accent)',
          }}
        />
        <div
          className="absolute w-[180px] h-[180px] rounded-full"
          style={{
            background: 'var(--color-app-accent)',
            filter: 'blur(40px)',
            top: '55%',
            right: '30%',
            animation: 'float2 10s ease-in-out infinite',
            boxShadow: '0 0 80px 40px var(--color-app-accent)',
          }}
        />
        <div
          className="absolute w-[220px] h-[220px] rounded-full"
          style={{
            background: 'var(--color-app-accent)',
            filter: 'blur(35px)',
            bottom: '-15%',
            right: '-10%',
            animation: 'float3 12s ease-in-out infinite',
            boxShadow: '0 0 80px 40px var(--color-app-accent)',
          }}
        />
      </div>

      {/* Animated blur balls - LEFT side (register) */}
      <div
        className={`absolute inset-0 z-[7] overflow-hidden pointer-events-none transition-opacity duration-700 ${
          !isLogin ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Bola extra - canto superior direito, só um pedaço */}
        <div
          className="absolute w-[180px] h-[180px] rounded-full"
          style={{
            background: 'var(--color-app-accent)',
            filter: 'blur(35px)',
            top: '-10%',
            left: '35%',
            animation: 'float3 9s ease-in-out infinite',
            boxShadow: '0 0 80px 40px var(--color-app-accent)',
          }}
        />
        <div
          className="absolute w-[150px] h-[150px] rounded-full"
          style={{
            background: 'var(--color-app-accent)',
            filter: 'blur(35px)',
            top: '15%',
            left: '8%',
            animation: 'float1 8s ease-in-out infinite',
            boxShadow: '0 0 80px 40px var(--color-app-accent)',
          }}
        />
        <div
          className="absolute w-[180px] h-[180px] rounded-full"
          style={{
            background: 'var(--color-app-accent)',
            filter: 'blur(40px)',
            top: '75%',
            left: '18%',
            animation: 'float2 10s ease-in-out infinite',
            boxShadow: '0 0 80px 40px var(--color-app-accent)',
          }}
        />
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-70px, 50px) scale(1.1); }
          50% { transform: translate(-40px, 90px) scale(1); }
          75% { transform: translate(50px, 40px) scale(0.9); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(60px, -70px) scale(0.9); }
          50% { transform: translate(90px, -40px) scale(1.1); }
          75% { transform: translate(40px, 60px) scale(1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-60px, -50px) scale(1.1); }
          50% { transform: translate(-90px, 40px) scale(0.9); }
          75% { transform: translate(-40px, 70px) scale(1); }
        }
      `}</style>

      {/* Left side — branding (login view) */}
      <div
        className={`relative z-10 hidden lg:flex flex-col justify-center items-center w-1/2 pb-20 transition-opacity duration-500 ${
          isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative flex flex-col items-start">
          {/* Background blur circle */}
          <div
            className="absolute w-[350px] h-[350px] xl:w-[450px] xl:h-[450px] rounded-full pointer-events-none"
            style={{
              background: 'var(--color-app-secondary)',
              filter: 'blur(80px)',
              opacity: 0.08,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <img
            src="/axion-icon-black.png"
            alt="Axion"
            className="w-64 xl:w-80 relative z-10"
          />
          <img
            src="/axion-logo.png"
            alt="Axion"
            className="mt-4 h-8 xl:h-10 ml-6 relative z-10"
          />
        </div>
      </div>

      {/* Right side — login form */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-6 sm:px-12 lg:pl-[50%] transition-opacity duration-500 ${
          isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <img src="/axion-icon-black.png" alt="Axion" className="w-32 mx-auto rounded-2xl" />
          <img src="/axion-logo.png" alt="Axion" className="mt-4 h-8 mx-auto" />
        </div>

        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <img
              src="/axion-icon-blue.png"
              alt="Axion"
              className="w-[62px] h-[62px] rounded-xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-app-secondary text-3xl font-bold text-center mb-2">
            Bem vindo de volta!
          </h1>
          <p className="text-app-secondary text-lg mb-8 text-center">
            Faça login para continuar
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/50 hover:text-app-secondary transition-colors"
                >
                  {showLoginPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-app-secondary text-app-bg font-semibold rounded-lg hover:bg-app-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-app-gray mt-4">
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

      {/* Right side — branding (register view) */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-10 hidden lg:flex flex-col justify-between w-1/2 px-12 py-8 transition-opacity duration-500 ${
          !isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Icon top right */}
        <div className="flex justify-end pt-4">
          <img
            src="/axion-icon-black.png"
            alt="Axion"
            className="w-16 h-16 rounded-xl"
          />
        </div>

        {/* Center content - logo */}
        <div className="flex justify-center w-full relative -mt-8">
          {/* Background blur circle */}
          <div
            className="absolute w-[300px] h-[300px] xl:w-[400px] xl:h-[400px] rounded-full pointer-events-none"
            style={{
              background: 'var(--color-app-secondary)',
              filter: 'blur(80px)',
              opacity: 0.08,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div className="flex flex-col items-end relative z-10">
            <p className="text-app-secondary text-3xl xl:text-4xl font-light italic mb-2">
              Bem vindo ao
            </p>
            <img
              src="/axion-logo.png"
              alt="Axion"
              className="h-24 xl:h-32"
            />
          </div>
        </div>

        {/* Bottom content - texts */}
        <div className="flex flex-col items-center text-center pb-20 pr-12">
          <p className="text-app-secondary/70 text-base xl:text-lg leading-relaxed whitespace-nowrap mb-2">
            cobranças automatizadas, contratos, assinaturas, produtos e controle total de<br />
            colaboradores, tudo em um ambiente seguro e escalável.
          </p>
          <p className="text-app-secondary text-xl xl:text-2xl font-semibold whitespace-nowrap">
            Sua gestão não pode depender de planilhas e sistemas limitados.
          </p>
        </div>
      </div>

      {/* Left side — register form */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-6 sm:px-12 lg:pr-[50%] transition-opacity duration-500 ${
          !isLogin && contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <img src="/axion-icon-black.png" alt="Axion" className="w-24 mx-auto rounded-2xl" />
          <img src="/axion-logo.png" alt="Axion" className="mt-3 h-6 mx-auto" />
        </div>

        <div className="w-full max-w-sm">
          {/* Beta warning */}
          <div className="flex items-center gap-4 px-4 py-3 mb-6 rounded-lg bg-app-secondary/10 border border-app-secondary/20">
            <span className="text-app-secondary text-xs font-semibold whitespace-nowrap">BETA</span>
            <p className="text-app-secondary/70 text-xs leading-tight">
              Aplicação em fase de testes. Os dados podem ser redefinidos a qualquer momento.
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRegStep('user')}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                regStep === 'user'
                  ? 'bg-app-secondary text-app-bg'
                  : 'bg-app-secondary/10 text-app-secondary/50'
              }`}
            >
              1. Usuário
            </button>
            <div className="w-6 h-px bg-app-secondary/30" />
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                regStep === 'company'
                  ? 'bg-app-secondary text-app-bg'
                  : 'bg-app-secondary/10 text-app-secondary/50'
              }`}
            >
              2. Empresa
            </span>
          </div>

          {/* Step 1: User info */}
          {regStep === 'user' && (
            <form onSubmit={handleNextStep} className="space-y-4">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/50 hover:text-app-secondary transition-colors"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/50 hover:text-app-secondary transition-colors"
                  >
                    {showRegConfirmPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-app-secondary text-app-bg font-semibold rounded-lg hover:bg-app-secondary/90 transition-colors"
              >
                Próximo
              </button>

              <p className="text-center text-sm text-app-gray mt-4">
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
            <form onSubmit={handleRegister} className="space-y-4">
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
                  className={`${inputClass} ${!department ? 'text-app-secondary/40' : ''}`}
                >
                  <option value="" disabled>Selecione um departamento</option>
                  {DEPARTMENTS.map((dep) => (
                    <option key={dep} value={dep} className="bg-app-bg text-app-secondary">
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRegStep('user')}
                  className="flex-1 py-3 border border-app-secondary/40 text-app-secondary font-semibold rounded-lg hover:bg-app-secondary/10 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex-1 py-3 bg-app-secondary text-app-bg font-semibold rounded-lg hover:bg-app-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>

              <p className="text-center text-sm text-app-gray mt-4">
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
