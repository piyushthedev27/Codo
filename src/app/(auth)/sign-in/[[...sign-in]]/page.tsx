/* eslint-disable @next/next/no-html-link-for-pages */
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617] selection:bg-[#00D1FF]/30">
      {/* Left side: Branding & Inspiration - Optimized for Desktop */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0F172A] border-r border-[#1E293B] relative overflow-hidden">
        {/* Subtle Industrial Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-[#00D1FF] rounded-sm flex items-center justify-center font-black text-[#020617]">C</div>
            <span className="text-xl font-bold tracking-tighter text-white uppercase">Codo_Engine</span>
          </div>

          <h1 className="text-6xl font-black text-white leading-none tracking-tight mb-6">
            ACCESS YOUR <br />
            <span className="text-[#00D1FF]">KNOWLEDGE_CORE</span>
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-md border-l-2 border-[#FF5C00] pl-6 py-2">
            Continue your learning journey with your AI study buddies and unlock deeper insights into your progress.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-mono text-[#475569] uppercase tracking-widest">
          <span>Auth_Module_v1.1</span>
          <div className="w-12 h-px bg-[#1E293B]"></div>
          <span>Identity_Verified</span>
        </div>
      </div>

      {/* Right side: Auth Form - Centered on mobile, Scrollable on large content */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="w-12 h-12 bg-[#00D1FF] rounded-sm flex items-center justify-center font-black text-[#020617] mx-auto mb-4">C</div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Welcome Back</h2>
            <p className="text-[#94A3B8]">Unlock your potential</p>
          </div>

          <div className="bg-[#0F172A] border border-[#1E293B] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 rounded-none relative">
            {/* Industrial corner accents */}
            <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-[#FF5C00]"></div>
            <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-[#00D1FF]"></div>

            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none w-full p-8',
                  headerTitle: 'text-2xl font-black text-white uppercase tracking-tight',
                  headerSubtitle: 'text-[#94A3B8]',
                  socialButtonsBlockButton: 'border border-[#1E293B] hover:bg-[#1E293B] text-white transition-all rounded-none',
                  socialButtonsBlockButtonText: 'text-white font-bold uppercase tracking-tight',
                  dividerLine: 'bg-[#1E293B]',
                  dividerText: 'text-[#475569] font-mono text-xs uppercase',
                  formFieldLabel: 'text-[#94A3B8] font-mono text-xs uppercase tracking-wider mb-1',
                  formFieldInput: 'bg-[#020617] border-[#1E293B] text-white focus:ring-1 focus:ring-[#00D1FF] focus:border-[#00D1FF] rounded-none',
                  formButtonPrimary: 'bg-[#00D1FF] hover:bg-[#00B8E6] text-[#020617] font-black uppercase tracking-widest text-sm py-3 rounded-none transition-all shadow-[0_0_20px_rgba(0,209,255,0.2)] hover:shadow-[0_0_30px_rgba(0,209,255,0.4)]',
                  footerActionText: 'text-[#94A3B8]',
                  footerActionLink: 'text-[#FF5C00] hover:text-[#E65100] font-bold uppercase tracking-tighter transition-all',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButtonIcon: 'text-[#00D1FF]',
                },
              }}
              redirectUrl="/onboarding"
              signUpUrl="/sign-up"
            />
          </div>

          <div className="text-center mt-8">
            <p className="text-sm font-mono text-[#475569] uppercase tracking-widest">
              New to Codo?{' '}
              <a
                href="/sign-up"
                className="text-[#FF5C00] hover:text-[#00D1FF] font-bold transition-all border-b border-transparent hover:border-[#00D1FF] pb-0.5"
              >
                CREATE ACCOUNT
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}