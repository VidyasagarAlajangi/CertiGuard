import React from 'react';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

const featureData = [
  {
    icon: <ShieldCheck size={28} className="text-white" />,
    title: "Blockchain Security",
    desc: "Leveraging immutable, decentralized ledger technology to ensure your certificates are tamper-proof and permanently verifiable.",
    bg: "from-blue-500 to-blue-700"
  },
  {
    icon: <Zap size={28} className="text-white" />,
    title: "Instant Verification",
    desc: "Our optimized system allows for lightning-fast certificate validation, providing immediate peace of mind for employers and institutions.",
    bg: "from-yellow-400 to-yellow-600"
  },
  {
    icon: <Globe size={28} className="text-white" />,
    title: "Global Accessibility",
    desc: "Access and verify credentials from anywhere in the world, at any time, through our globally available and secure platform.",
    bg: "from-green-500 to-green-700"
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-12 sm:py-10 overflow-hidden">
      {/* Dynamic gradient background with animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}></div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-1/6 right-1/3 w-1 h-1 bg-yellow-400/40 rounded-full animate-bounce delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-6 z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white mb-4 tracking-tight">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">CertGuard</span>?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Our platform offers unparalleled security, real-time speed, and global accessibility for modern certificate verification.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {featureData.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-slate-800/20 backdrop-blur-lg border border-slate-600/30 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-3 hover:border-blue-400/50 hover:bg-slate-800/40"
            >
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className={`w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.bg} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300">
                  {feature.desc}
                </p>
              </div>
              
              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.bg} rounded-b-2xl w-0 group-hover:w-full transition-all duration-500`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;