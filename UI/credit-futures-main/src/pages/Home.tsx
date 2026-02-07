import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  BarChart3, 
  Shield, 
  Lock, 
  Zap,
  ChevronRight,
  Check,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const STEPS = [
  {
    number: '01',
    title: 'PURCHASE',
    description: 'Buy any item from our marketplace using crypto-backed credit. No upfront payment required.',
    icon: ShoppingCart,
  },
  {
    number: '02',
    title: 'AUTO-INVEST',
    description: 'Your purchase amount is automatically invested into XRP by our financial institution.',
    icon: TrendingUp,
  },
  {
    number: '03',
    title: 'CONFIGURE',
    description: 'View your position on the terminal. Choose LONG or SHORT direction and set settlement bounds.',
    icon: Settings,
  },
  {
    number: '04',
    title: 'MONITOR',
    description: 'Track real-time P&L as XRP moves. Watch your position approach settlement or breach bounds.',
    icon: BarChart3,
  },
  {
    number: '05',
    title: 'SETTLE',
    description: 'Position settles within your bounds. Pay less, pay more, or bounce—full transparency.',
    icon: Check,
  },
];

const DIFFERENTIATORS = [
  {
    title: 'TERMINAL-GRADE TRANSPARENCY',
    description: 'Every data point visible. Every calculation shown. No hidden fees, no opaque algorithms.',
  },
  {
    title: 'BOUNDS-BASED SETTLEMENT',
    description: 'Define your max and min payment thresholds. Control your risk exposure with precision.',
  },
  {
    title: 'SPECULATE ON YOUR DEBT',
    description: 'Turn purchases into trading opportunities. Go LONG or SHORT on your own credit obligations.',
  },
  {
    title: 'REAL-TIME MONITORING',
    description: 'Live XRP price feeds. Instant P&L updates. Position status changes as markets move.',
  },
];

const PRICING_TIERS = [
  {
    name: 'FREE',
    price: '$0',
    period: '/month',
    description: 'For individuals testing the platform',
    features: [
      'Up to 5 active positions',
      'Basic settlement bounds',
      '24h price history',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'PRO',
    price: '$49',
    period: '/month',
    description: 'For active traders and small businesses',
    features: [
      'Unlimited positions',
      'Advanced bounds configuration',
      '30-day price history',
      'Priority support',
      'CSV export',
      'API access',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'INSTITUTIONAL',
    price: 'Custom',
    period: '',
    description: 'For enterprises and financial institutions',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom settlement rules',
      'Bulk position management',
      'SLA guarantees',
      'White-label options',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const FAQS = [
  {
    question: 'How does LONG/SHORT affect my payment?',
    answer: 'LONG benefits you if XRP rises—your final payment decreases. SHORT benefits you if XRP falls. Your direction determines whether market moves work for or against you.',
  },
  {
    question: 'What happens if my bounds are breached?',
    answer: 'If XRP moves beyond your max or min bound, the position "bounces" and settles at the breached limit. You pay the max if price moves against you past that threshold.',
  },
  {
    question: 'Can I close a position early?',
    answer: 'Yes. You can manually close any active position before its time limit expires. Settlement occurs at current market conditions.',
  },
  {
    question: 'Is this gambling?',
    answer: 'This is speculative trading on crypto-backed credit. Like any financial instrument, outcomes are uncertain. We provide tools for risk management, not guarantees. Trade responsibly.',
  },
  {
    question: 'How is my payment calculated?',
    answer: 'Final payment = Original purchase × (Entry XRP Price / Settlement XRP Price) for LONG, or the inverse for SHORT, clamped within your configured bounds.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-grid-line bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-profit rounded-full pulse-glow" />
            <span className="text-sm font-bold tracking-widest text-profit">
              CRYPTO TOMORROW
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth?mode=login" className="text-xs tracking-wider">
                LOG IN
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-profit text-background hover:bg-profit/90">
              <Link to="/auth?mode=signup" className="text-xs tracking-wider font-bold">
                GET STARTED
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--grid-line))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--grid-line))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 border border-profit/30 bg-profit/10 text-profit text-xs font-bold tracking-widest mb-6">
                CRYPTO-BACKED CREDIT PLATFORM
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-profit">SHOP TODAY.</span>
                <br />
                <span className="text-foreground">SETTLE TOMORROW.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Purchase anything with crypto-backed credit. After checkout, decide whether to go 
                <span className="text-profit font-semibold"> LONG </span>
                or
                <span className="text-loss font-semibold"> SHORT </span>
                on XRP to influence your final payment. Trade your own debt.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="bg-profit text-background hover:bg-profit/90">
                  <Link to="/auth?mode=signup" className="text-sm tracking-wider font-bold">
                    GET STARTED
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-grid-line">
                  <Link to="/terminal" className="text-sm tracking-wider">
                    VIEW DEMO
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Terminal Preview Mock */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="border border-grid-line bg-card rounded-lg overflow-hidden shadow-2xl shadow-profit/10">
                <div className="border-b border-grid-line px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-loss" />
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <div className="w-2 h-2 rounded-full bg-profit" />
                  <span className="ml-4 text-xs text-muted-foreground tracking-wider">TERMINAL</span>
                </div>
                
                <div className="p-4 space-y-3">
                  {/* XRP Ticker Mock */}
                  <div className="flex items-center justify-between border-b border-grid-line pb-3">
                    <span className="text-xs text-muted-foreground tracking-wider">XRP/USD</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-profit font-mono">$0.512300</span>
                      <span className="text-xs text-profit ml-2">+2.45%</span>
                    </div>
                  </div>
                  
                  {/* Position Rows Mock */}
                  {[
                    { name: 'CLOUD SERVER', status: 'ACTIVE', direction: 'LONG', pnl: '+$12.34', pnlColor: 'text-profit' },
                    { name: 'MACBOOK PRO', status: 'ACTIVE', direction: 'SHORT', pnl: '-$45.00', pnlColor: 'text-loss' },
                    { name: 'SSL CERTIFICATE', status: 'UNCONFIGURED', direction: 'UNSET', pnl: '$0.00', pnlColor: 'text-muted-foreground' },
                  ].map((pos, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-grid-line/50 text-xs">
                      <span className="text-foreground font-medium tracking-wide">{pos.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pos.status === 'ACTIVE' ? 'bg-profit/20 text-profit' : 'bg-warning/20 text-warning'
                        }`}>
                          {pos.status}
                        </span>
                        <span className={`font-mono ${pos.pnlColor}`}>{pos.pnl}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-profit/5 via-transparent to-loss/5 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-grid-line">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-xs text-profit tracking-widest font-bold">PROCESS</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">HOW IT WORKS</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From purchase to settlement in five transparent steps.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="border border-grid-line bg-card p-6 h-full hover:border-profit/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-profit/50">{step.number}</span>
                    <step.icon className="w-5 h-5 text-profit" />
                  </div>
                  <h3 className="text-sm font-bold tracking-wider mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                
                {index < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-grid-line z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section id="product" className="py-20 border-t border-grid-line bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-xs text-profit tracking-widest font-bold">FEATURES</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">WHY CRYPTO TOMORROW</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {DIFFERENTIATORS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-grid-line bg-background p-8 hover:border-profit/50 transition-colors"
              >
                <div className="w-10 h-10 border border-profit/30 bg-profit/10 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-profit" />
                </div>
                <h3 className="text-lg font-bold tracking-wider mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 border-t border-grid-line">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs text-profit tracking-widest font-bold">SECURITY</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight mb-6">
                BANK-GRADE PROTECTION
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your data and assets are protected with enterprise-level security infrastructure. 
                Every transaction is encrypted, every position is auditable.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'End-to-end encryption on all data' },
                  { icon: Lock, text: 'Secure cold storage for crypto assets' },
                  { icon: Check, text: 'SOC 2 Type II compliant infrastructure' },
                  { icon: Check, text: 'Real-time fraud detection systems' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-profit/30 bg-profit/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-profit" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border border-warning/30 bg-warning/5 p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-warning/50 bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-warning font-bold">!</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider text-warning mb-2">RISK DISCLAIMER</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    CryptoTomorrow provides tools for crypto-backed credit settlement. This is not financial advice. 
                    Settlement outcomes are determined by market conditions and may result in increased payment obligations. 
                    Past performance does not guarantee future results. Trade responsibly and only with funds you can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-grid-line bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-xs text-profit tracking-widest font-bold">PRICING</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">CHOOSE YOUR PLAN</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border bg-background p-8 relative ${
                  tier.highlighted 
                    ? 'border-profit shadow-lg shadow-profit/20' 
                    : 'border-grid-line'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-profit text-background text-xs font-bold tracking-wider">
                    POPULAR
                  </div>
                )}
                
                <h3 className="text-sm font-bold tracking-widest mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">{tier.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-profit flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    tier.highlighted 
                      ? 'bg-profit text-background hover:bg-profit/90' 
                      : 'bg-secondary'
                  }`}
                  asChild
                >
                  <Link to="/auth?mode=signup" className="text-xs tracking-wider font-bold">
                    {tier.cta}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 border-t border-grid-line">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-xs text-profit tracking-widest font-bold">SUPPORT</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">FREQUENTLY ASKED</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group border border-grid-line bg-card"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-semibold tracking-wide pr-4">{faq.question}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-grid-line bg-gradient-to-b from-background to-card">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            READY TO TRADE YOUR DEBT?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of users speculating on their own credit obligations. Start shopping, start trading.
          </p>
          <Button size="lg" asChild className="bg-profit text-background hover:bg-profit/90">
            <Link to="/auth?mode=signup" className="text-sm tracking-wider font-bold">
              GET STARTED NOW
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-grid-line py-12 bg-card">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-profit rounded-full" />
                <span className="text-sm font-bold tracking-widest text-profit">CRYPTO TOMORROW</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Crypto-backed credit settlement platform. Shop today, settle tomorrow.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold tracking-widest mb-4">PRODUCT</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Security', 'Documentation'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold tracking-widest mb-4">COMPANY</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Press'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold tracking-widest mb-4">LEGAL</h4>
              <ul className="space-y-2">
                {['Terms of Service', 'Privacy Policy', 'Risk Disclosure', 'Compliance'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-grid-line pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CryptoTomorrow. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Not financial advice. Trade responsibly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
