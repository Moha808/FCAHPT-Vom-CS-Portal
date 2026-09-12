import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Users, ArrowRight, ShieldCheck, 
  GraduationCap, CheckCircle2, Cpu, Laptop, Menu, X, Award, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-vom-green selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/logo.png" 
                alt="FCAHPT Vom Logo" 
                className="w-12 h-12 rounded-xl object-cover shadow-md"
              />
              <div>
                <span className="font-extrabold text-xl text-gray-900 block leading-tight tracking-tight">FCAHPT Vom</span>
                <span className="text-xs text-vom-green font-semibold tracking-wider uppercase">Computer Science Dept</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-vom-green transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-vom-green transition-colors">How It Works</a>
              <a href="#curriculum" className="text-sm font-medium text-gray-600 hover:text-vom-green transition-colors">Curriculum</a>
              <div className="h-5 w-px bg-gray-200"></div>
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-vom-green px-3 py-2 rounded-lg transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-vom-green hover:bg-vom-green-light text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-vom-green/20 hover:shadow-lg hover:shadow-vom-green/30">
                Student Portal
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-vom-green rounded-lg focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
            <a 
              href="#features" 
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              How It Works
            </a>
            <a 
              href="#curriculum" 
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Curriculum
            </a>
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
              <Link 
                to="/login" 
                onClick={() => setMobileNavOpen(false)}
                className="w-full text-center py-2.5 font-semibold text-gray-700 border border-gray-200 rounded-xl"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileNavOpen(false)}
                className="w-full text-center py-2.5 font-semibold text-white bg-vom-green rounded-xl"
              >
                Student Portal
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-vom-green to-emerald-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-vom-gold/20 via-transparent to-transparent opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold text-vom-gold uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-vom-gold" />
                <span>Department of Computer Science — FCAHPT Vom</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Automated Academic Guidance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-vom-gold via-yellow-200 to-amber-400">Progress Tracking</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Empowering Computer Science students at the Federal College of Animal Health and Production Technology, Vom with real-time degree audits, intelligent course recommendation engines, and seamless academic advisement.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
                <Link 
                  to="/register" 
                  className="bg-vom-gold hover:bg-yellow-400 text-gray-950 px-8 py-4 rounded-xl font-extrabold text-base transition-all shadow-xl shadow-vom-gold/20 flex items-center justify-center group"
                >
                  <span>Student Registration</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-base transition-all backdrop-blur-md flex items-center justify-center"
                >
                  <span>Access Account</span>
                </Link>
              </div>

              {/* Verified Badge */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs text-white/70">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-vom-gold" />
                  <span>NBTE Accredited ND & HND</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-vom-gold" />
                  <span>Automated CGPA</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visuals / Image Stack */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Decorative Blur Backing */}
                <div className="absolute -inset-2 bg-gradient-to-r from-vom-gold to-emerald-400 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

                {/* Primary Graphic Card */}
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-6">
                  
                  {/* Top Computer Science Banner Image */}
                  <div className="relative h-56 rounded-2xl overflow-hidden shadow-lg group">
                    <img 
                      src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" 
                      alt="Computer Science Students in Lab" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent flex items-end p-4">
                      <div>
                        <span className="bg-vom-gold text-gray-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">CS Lab Portal</span>
                        <h4 className="text-white font-bold text-sm mt-1">Real-time Course Audit & Guidance</h4>
                      </div>
                    </div>
                  </div>

                  {/* Visual CGPA Preview Box */}
                  <div className="bg-white/90 text-gray-900 rounded-2xl p-4 shadow-xl border border-white/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-vom-green flex items-center justify-center font-bold">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Current Status</p>
                          <p className="text-sm font-bold text-gray-900">ND 2 Computer Science</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-green-100 text-vom-green text-xs font-bold rounded-full">Good Standing</span>
                    </div>

                    {/* CGPA Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-600">Calculated CGPA</span>
                        <span className="text-vom-green font-bold">3.85 / 4.00</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-vom-green to-emerald-400 w-[92%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Feature Badges */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                      <p className="text-xs text-white/70">Required Credits</p>
                      <p className="text-lg font-bold text-vom-gold">72 Units</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                      <p className="text-xs text-white/70">Advisement Status</p>
                      <p className="text-lg font-bold text-emerald-300">Approved</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Statistics Banner */}
      <section className="bg-gray-900 text-white py-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-vom-gold">100%</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">Computer Science Focus</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">ND & HND</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">Accredited Curricula</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-vom-gold">Real-time</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">Degree Audit Engine</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">24/7</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">Advisor Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-vom-green font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Department Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
              Smarter Academic Management Built for CS Students
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Designed specifically for the Computer Science department to eliminate enrollment friction, carryover errors, and manual graduation checks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Feature 1 */}
            <div className="bg-gray-50/80 p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-100 text-vom-green rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-100 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Degree Audit</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Instantly compute your semester GPA and cumulative CGPA. Track earned credits against the official NBTE Computer Science curriculum in real time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50/80 p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-amber-100 group-hover:scale-110 transition-transform">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Prerequisite Checking</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Smart recommendation algorithms ensure you never register for advanced programming or database courses without passing prerequisite modules first.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50/80 p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-100 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Direct Advisor Channel</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Seamlessly request course approvals and receive official announcements directly from your designated departmental academic advisor.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Visual Showcase Section with Realistic Tech Image */}
      <section id="how-it-works" className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Image Box */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 group">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" 
                alt="Students collaborating in Computer Science Lab" 
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent flex items-end p-8">
                <div className="text-white space-y-1">
                  <span className="bg-vom-gold text-gray-950 text-xs font-bold px-3 py-1 rounded-full uppercase">FCAHPT Vom</span>
                  <h3 className="text-xl font-bold">Empowering Tomorrow's Software Engineers</h3>
                </div>
              </div>
            </div>

            {/* How It Works Steps */}
            <div className="space-y-8">
              <div>
                <span className="text-vom-green font-bold text-xs uppercase tracking-widest">Simple Workflow</span>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-2">How The Portal Works For You</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-vom-green text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Create Your Student Account</h4>
                    <p className="text-sm text-gray-600 mt-1">Register using your official matriculation number and select your Computer Science level (ND 1, ND 2, HND 1, or HND 2).</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-vom-gold text-gray-950 font-bold flex items-center justify-center flex-shrink-0 shadow-md">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">View Recommended Courses</h4>
                    <p className="text-sm text-gray-600 mt-1">The system automatically recommends eligible courses based on your passed prerequisites and credit limits.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Monitor Graduation Progress</h4>
                    <p className="text-sm text-gray-600 mt-1">Watch your CGPA trend chart update in real time as your advisor confirms your course grades each semester.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/register" className="inline-flex items-center text-vom-green font-bold hover:text-vom-green-light transition-colors group">
                  <span>Register Now to Access Your Dashboard</span>
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-vom-green font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Academic Programs
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-4">Department Curricula</h2>
            <p className="mt-4 text-gray-600">
              Explore our NBTE-approved courses spanning National Diploma and Higher National Diploma specializations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-xl text-gray-900 mb-2">ND Computer Science</h3>
              <p className="text-sm text-gray-500 mb-4">Core foundation in programming, networking, and system analysis.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Intro to Computing</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Java Programming</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Data Structures</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-xl text-gray-900 mb-2">HND Networking</h3>
              <p className="text-sm text-gray-500 mb-4">Advanced study in cloud architecture and enterprise networks.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Cloud Automation</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Network Security</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Routing & Switching</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-xl text-gray-900 mb-2">HND Software Dev</h3>
              <p className="text-sm text-gray-500 mb-4">Full-stack engineering and software project management.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Advanced Software Eng</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> Mobile App Dev</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-vom-green mr-2" /> API Design</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-vom-green to-emerald-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Award className="w-12 h-12 text-vom-gold mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Take Control of Your Academic Journey?</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Join your fellow Computer Science students at Federal College of Animal Health and Production Technology, Vom.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-vom-gold hover:bg-yellow-400 text-gray-950 px-8 py-3.5 rounded-xl font-extrabold text-base transition-all shadow-xl">
              Create Student Account
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold text-base transition-all">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 text-gray-400 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-vom-gold rounded-lg flex items-center justify-center text-gray-950 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-vom-green" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">FCAHPT Vom</p>
              <p className="text-xs text-gray-500">Department of Computer Science</p>
            </div>
          </div>
          <p className="text-xs text-center md:text-right text-gray-500">
            Federal College of Animal Health and Production Technology, Vom, Plateau State.<br />
            © {new Date().getFullYear()} FCAHPT Vom Academic Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
