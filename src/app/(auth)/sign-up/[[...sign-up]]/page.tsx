import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join Codo Today
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Start learning with AI study buddies Sarah, Alex, and Jordan
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm normal-case',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
              },
            }}
            redirectUrl="/onboarding"
            signInUrl="/sign-in"
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <a 
              href="/sign-in" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}