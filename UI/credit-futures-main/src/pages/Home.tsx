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
  ArrowRight,
  Sparkles,
  Target,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import howItWorksImg from '@/assets/how-it-works.jpeg';



const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'FAQ', href: '#faq' },
];

const STEPS = [
  {
    number: '01',
    title: 'Shop Anywhere',
    description: 'Use your Winback card for everyday purchases. No upfront payment required.',
    icon: ShoppingCart,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    number: '02',
    title: 'Make a Prediction',
    description: 'After checkout, predict if your chosen asset will go up or down.',
    icon: TrendingUp,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    number: '03',
    title: 'Set Your Terms',
    description: 'Choose your potential cashback reward and your max downside.',
    icon: Settings,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    number: '04',
    title: 'Track Progress',
    description: 'Watch your prediction in real-time. See potential winback grow.',
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    number: '05',
    title: 'Winback',
    description: 'Correct prediction? Get cashback. Wrong? Pay a small premium.',
    icon: Sparkles,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
];

const DIFFERENTIATORS = [
  {
    title: 'No Unlimited Downside',
    description: 'Your downside is capped by design. You choose the cap up front  you will never lose more than your selected amount.',
    icon: Shield,
  },
  {
    title: 'Feels Like Normal Banking',
    description: 'No complex crypto setup. No seed phrases. No wallets to manage. Winback behaves like a traditional card experience.',
    icon: Lock,
  },
  {
    title: 'Transparent Settlement',
    description: 'Clear terms, clear outcomes. Every position has explicit rules and an auditable settlement trail.',
    icon: BarChart3,
  },
  {
    title: 'Built for Trust',
    description: 'No hidden mechanics, no confusing fee games. You always know what you can win, and what you can lose before you commit.',
    icon: Target,
  },
];


const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Up to 5 active predictions',
      'Basic reward limits',
      '24h price history',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For active predictors',
    features: [
      'Unlimited predictions',
      'Advanced limit configuration',
      '30-day price history',
      'Priority support',
      'CSV export',
      'API access',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Business',
    price: 'Custom',
    period: '',
    description: 'For teams and enterprises',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom settlement rules',
      'Team management',
      'SLA guarantees',
      'White-label options',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const FAQS = [
  {
    question: 'How does the prediction affect my payment?',
    answer: 'If you predict correctly, you earn extra cashback on your purchase. If your prediction is wrong, your loss is capped to your selected cashback amount — you never lose more than what you set.',
  },

  {
    question: 'What happens if I reach my limit?',
    answer: 'Your prediction automatically settles at your set limit. You\'ll never pay more than your maximum downside setting.',
  },
  {
    question: 'Can I close a prediction early?',
    answer: 'Yes. You can settle any active prediction at current market conditions whenever you want.',
  },
  {
    question: 'Is this gambling?',
    answer: 'Winback is a financial product that adds a prediction element to your purchases. Like any financial product, outcomes vary. We provide tools for risk management and full transparency.',
  },
  {
    question: 'How is my cashback calculated?',
    answer: 'Your reward is based on the price movement of your chosen asset from when you made your purchase to when your prediction settles, capped within your configured limits.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              Winback
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth?mode=login">
                Log In
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?mode=signup">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-background">
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
                <Sparkles className="w-4 h-4" />
                Every purchase is a play
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Shop. Predict.
                <br />
                <span className="text-primary">Winback.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Turn every purchase into a winning opportunity. Predict market movements and
                earn cashback when you're right. Your risk is always limited to what you choose.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/auth?mode=signup">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/terminal">
                    View Demo
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-premium">
                <div className="border-b border-border px-5 py-4 flex items-center justify-between bg-gradient-to-r from-slate-900 to-blue-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Your Balance</div>
                      <div className="text-blue-200 text-sm">Available to withdraw</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">$15,420.50</div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Position Rows */}
                  {[
                    { name: 'Coffee Shop Purchase', status: 'Active', direction: 'up', pnl: '+$2.34', pnlPositive: true },
                    { name: 'Online Electronics', status: 'Active', direction: 'down', pnl: '-$5.00', pnlPositive: false },
                    { name: 'Grocery Store', status: 'Pending', direction: null, pnl: '$0.00', pnlPositive: null },
                  ].map((pos, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <div className="font-medium">{pos.name}</div>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${pos.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                          {pos.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${pos.pnlPositive === true ? 'text-emerald-600' :
                          pos.pnlPositive === false ? 'text-red-500' : 'text-muted-foreground'
                          }`}>
                          {pos.pnl}
                        </div>
                        {pos.direction && (
                          <span className={`text-xs ${pos.direction === 'up' ? 'text-blue-600' : 'text-rose-500'
                            }`}>
                            Predicted {pos.direction === 'up' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">Five simple steps</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From purchase to winback in a transparent, straightforward process.
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
                <div className="bg-white border border-border rounded-xl p-6 h-full hover:shadow-card-hover hover:border-primary/20 transition-all duration-200">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {index < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-border z-10" />
                )}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
              <img
                src={howItWorksImg}
                alt="Winback flow illustration"
                className="w-[800px] h-[400px] object-contain mx-auto"
                loading="lazy"
              />
            </div>

            {/* optional caption */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Example flow — purchase → prediction → limits → settlement
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section id="product" className="py-20 border-t border-border bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">Why choose Winback</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {DIFFERENTIATORS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-border rounded-xl p-8 hover:shadow-card-hover hover:border-primary/20 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* XRP Ledger */}
      <section id="xrpl" className="py-20 border-t border-border bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-medium text-primary">Settlement Layer</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight mb-6">
                Powered by the XRP Ledger
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Winback uses the XRP Ledger as a transparent settlement rail — fast finality, low fees,
                and auditable transaction history. You get a clean record of what happened and why.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Zap, text: 'Fast settlement with low network fees' },
                  { icon: Shield, text: 'Auditable, tamper-resistant transaction trail' },
                  { icon: BarChart3, text: 'Transparent execution and settlement reporting' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Transparent by design</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No vague fees. No hidden mechanics. Winback is designed to feel like a normal card
                    product on the surface — with a transparent settlement trail underneath.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Security */}
      <section id="security" className="py-20 border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-medium text-primary">Security</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight mb-6">
                Bank-grade protection
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your data and funds are protected with enterprise-level security.
                Every transaction is encrypted, every prediction is auditable.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'End-to-end encryption on all data' },
                  { icon: Lock, text: 'Secure asset storage' },
                  { icon: Check, text: 'SOC 2 Type II compliant infrastructure' },
                  { icon: Check, text: 'Real-time fraud detection systems' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Risk Disclosure</h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Winback involves predicting market movements. Outcomes are determined by market
                    conditions and may result in paying more than your original purchase.
                    Past performance does not guarantee future results. Only predict with amounts you're
                    comfortable potentially paying extra on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      {/* <section id="pricing" className="py-20 border-t border-border bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">Choose your plan</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border rounded-xl p-8 relative ${tier.highlighted
                  ? 'border-primary shadow-premium'
                  : 'border-border'
                  }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Popular
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={tier.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link to="/auth?mode=signup">
                    {tier.cta}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section id="faq" className="py-20 border-t border-border">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary">Support</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">Frequently asked</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white border border-border rounded-xl"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors rounded-xl">
                  <span className="text-sm font-semibold pr-4">{faq.question}</span>
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
      <section className="py-20 border-t border-border bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Ready to start winning?
          </h2>
          <p className="text-blue-200 mb-8 max-w-lg mx-auto">
            Join thousands of users turning everyday purchases into winning opportunities.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth?mode=signup">
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-lg font-bold">Winback</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Shop. Predict. Winback. Turn every purchase into a winning opportunity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Security', 'Documentation'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Press'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Terms of Service', 'Privacy Policy', 'Risk Disclosure', 'Compliance'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Winback. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Not financial advice. Predict responsibly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
