import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate auth delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo: just navigate to the app
    navigate('/bank');
    setIsLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-card border-r border-grid-line">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--grid-line))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--grid-line))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-3 h-3 bg-profit rounded-full pulse-glow" />
            <span className="text-lg font-bold tracking-widest text-profit">
              CRYPTO TOMORROW
            </span>
          </Link>
          
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="text-profit">TRADE</span> YOUR DEBT.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            Access the terminal. Configure your positions. Speculate on your own credit obligations with full transparency.
          </p>
          
          <div className="mt-12 space-y-4">
            {[
              'Real-time XRP price feeds',
              'Configurable settlement bounds',
              'Terminal-grade position tracking',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1 h-1 bg-profit rounded-full" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-profit/5 to-transparent" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="tracking-wider">BACK TO HOME</span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <div className="w-2 h-2 bg-profit rounded-full pulse-glow" />
                <span className="text-sm font-bold tracking-widest text-profit">
                  CRYPTO TOMORROW
                </span>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'login' 
                  ? 'Enter your credentials to access the terminal' 
                  : 'Start trading your debt in minutes'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs tracking-wider">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="trader@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 bg-card border-grid-line focus:border-profit font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs tracking-wider">
                  PASSWORD
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 bg-card border-grid-line focus:border-profit font-mono text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs tracking-wider">
                    CONFIRM PASSWORD
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-11 bg-card border-grid-line focus:border-profit font-mono text-sm"
                    required
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-muted-foreground hover:text-profit transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-profit text-background hover:bg-profit/90 text-sm tracking-wider font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    PROCESSING...
                  </span>
                ) : (
                  mode === 'login' ? 'ACCESS TERMINAL' : 'CREATE ACCOUNT'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-2 text-profit hover:underline font-semibold"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>

            {mode === 'signup' && (
              <p className="mt-6 text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-foreground hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-foreground hover:underline">Privacy Policy</a>.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
