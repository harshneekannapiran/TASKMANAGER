import { Link } from 'react-router-dom';
import { ArrowRight, CheckSquare, Clock, Target, Users, Star, Zap, TrendingUp, Shield, Globe, Smartphone, Layers, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Layers className="h-6 w-6 text-white" />
  </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
  TRILO
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Reviews</a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Boost your productivity by 300%
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="text-gray-900 dark:text-white">
                  Master Your
                </span>
                <br />
                <span className="text-blue-600 dark:text-blue-400">
                  Daily Tasks
                </span>
</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                Transform chaos into clarity with our intelligent task management platform. 
                Track time, collaborate seamlessly, and achieve more than ever before.
              </p>
</div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
            <Link
                to="/signup"
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 text-lg font-semibold"
            >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
                to="/login"
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 text-lg font-semibold hover:shadow-lg"
            >
              Sign In
            </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">4.9/5</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">10,000+ users</span>
            </div>
          </div>

          {/* Right Content - Hero Illustration */}
          <div className="relative">
            <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="space-y-6">
                {/* Task Cards */}
                <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Complete project proposal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due in 2 hours</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-2xl">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Team meeting</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In progress - 25 min</p>
                  </div>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>

                <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Review code changes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due tomorrow</p>
                  </div>
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Tasks Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.2h</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Time Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-indigo-400 rounded-full animate-bounce delay-1000"></div>
          </div>
          </div>
        </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to
            <span className="text-blue-600 dark:text-blue-400"> stay productive</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Powerful features designed to help you focus, collaborate, and achieve your goals faster than ever.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Smart Task Management",
              description: "AI-powered task prioritization and intelligent scheduling to keep you on track.",
              bgColor: "bg-blue-50 dark:bg-blue-900/30",
              iconColor: "bg-blue-600"
            },
            {
              icon: Clock,
              title: "Pomodoro Timer",
              description: "Built-in time tracking with customizable work sessions and detailed analytics.",
              bgColor: "bg-purple-50 dark:bg-purple-900/30",
              iconColor: "bg-purple-600"
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Real-time updates, shared calendars, and seamless team communication.",
              bgColor: "bg-green-50 dark:bg-green-900/30",
              iconColor: "bg-green-600"
            },
            {
              icon: TrendingUp,
              title: "Progress Analytics",
              description: "Visual insights into your productivity patterns and performance metrics.",
              bgColor: "bg-orange-50 dark:bg-orange-900/30",
              iconColor: "bg-orange-600"
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Enterprise-grade security with end-to-end encryption for your data.",
              bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
              iconColor: "bg-indigo-600"
            },
            {
              icon: Smartphone,
              title: "Cross-Platform",
              description: "Access your tasks anywhere with our mobile and desktop applications.",
              bgColor: "bg-pink-50 dark:bg-pink-900/30",
              iconColor: "bg-pink-600"
            }
          ].map((feature, index) => (
            <div key={index} className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:-translate-y-2">
              <div className={`w-16 h-16 ${feature.iconColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by teams worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            See what our users have to say about their productivity transformation.
              </p>
            </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Product Manager",
              company: "TechCorp",
              content: "TRILO has completely transformed how our team manages projects. The time tracking feature alone has increased our efficiency by 40%.",
              rating: 5
            },
            {
              name: "Marcus Rodriguez",
              role: "Software Engineer",
              company: "InnovateLab",
              content: "The Pomodoro timer integration is brilliant. I've never been more focused during my coding sessions. Highly recommended!",
              rating: 5
            },
            {
              name: "Emily Watson",
              role: "Marketing Director",
              company: "GrowthCo",
              content: "The collaboration features are game-changing. Our remote team feels more connected than ever. TRILO is essential for our workflow.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <div key={index} className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>
            </div>
          ))}
              </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that works best for you and your team.
              </p>
            </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "Free",
              period: "forever",
              description: "Perfect for individuals getting started",
              features: [
                "Up to 50 tasks",
                "Basic time tracking",
                "Personal calendar",
                "Email support"
              ],
              buttonText: "Get Started",
              buttonLink: "/signup",
              popular: false
            },
            {
              name: "Pro",
              price: "$9",
              period: "per month",
              description: "Great for professionals and small teams",
              features: [
                "Unlimited tasks",
                "Advanced time tracking",
                "Team collaboration",
                "Priority support",
                "Custom categories",
                "Export reports"
              ],
              buttonText: "Start Free Trial",
              buttonLink: "/signup",
              popular: true
            },
            {
              name: "Enterprise",
              price: "$29",
              period: "per month",
              description: "For large teams and organizations",
              features: [
                "Everything in Pro",
                "Advanced analytics",
                "API access",
                "Custom integrations",
                "Dedicated support",
                "SSO & advanced security"
              ],
              buttonText: "Contact Sales",
              buttonLink: "/signup",
              popular: false
            }
          ].map((plan, index) => (
            <div key={index} className={`relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              plan.popular 
                ? 'border-blue-500 dark:border-blue-400 scale-105' 
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
              </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
              </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period !== "forever" && (
                    <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {plan.description}
              </p>
            </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.buttonLink}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
          </div>
        </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                TRILO
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
              <span>© 2024 TRILO. All rights reserved.</span>
            </div>
      </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;