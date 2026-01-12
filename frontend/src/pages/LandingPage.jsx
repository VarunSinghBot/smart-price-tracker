import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LandingPage() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe all elements with fade-in class
    const elements = document.querySelectorAll(".fade-in-section");
    elements.forEach((el) => observer.observe(el));

    // Parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxElements = document.querySelectorAll(".parallax");
      
      parallaxElements.forEach((el) => {
        const speed = el.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Accurate Price Tracking",
      description: "Monitor prices across multiple retailers in real-time with our advanced tracking algorithms.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Intelligent Deal Alerts",
      description: "Get instant notifications when prices drop below your target, never miss a deal again.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Multi-platform Comparison",
      description: "Compare prices from Amazon, eBay, Walmart, and more - all in one convenient dashboard.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      title: "Price History Charts",
      description: "View detailed price trends over time and make informed purchasing decisions.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      {/* Hero Section with Parallax */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="parallax absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" data-speed="0.3"></div>
          <div className="parallax absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" data-speed="0.5"></div>
          <div className="parallax absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" data-speed="0.4"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
              Smart Price Tracker &<br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-yellow-300 to-yellow-500">
                Deal Intelligence Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Track product prices across multiple platforms, get instant deal alerts,
              and never overpay again. Save money effortlessly with intelligent price monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <button
                onClick={scrollToFeatures}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features to{" "}
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Save You Money
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to track prices and find the best deals online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="fade-in-section opacity-0 translate-y-10 transition-all duration-1000 bg-white p-6 rounded-xl shadow-md hover:shadow-2xl border border-gray-100 group"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-blue-600 mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-blue-50 to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              How It{" "}
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Start saving in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600"></div>

            <div className="text-center fade-in-section opacity-0 translate-y-10 transition-all duration-1000 animation-delay-200">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg transform hover:scale-110 transition-transform">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Add Products
              </h3>
              <p className="text-gray-600">
                Simply paste the product URL from your favorite online store
              </p>
            </div>

            <div className="text-center fade-in-section opacity-0 translate-y-10 transition-all duration-1000 animation-delay-400">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg transform hover:scale-110 transition-transform">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping animation-delay-200"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Set Your Target Price
              </h3>
              <p className="text-gray-600">
                Choose your ideal price and we'll monitor it 24/7
              </p>
            </div>

            <div className="text-center fade-in-section opacity-0 translate-y-10 transition-all duration-1000 animation-delay-600">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg transform hover:scale-110 transition-transform">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping animation-delay-400"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Get Instant Alerts
              </h3>
              <p className="text-gray-600">
                Receive notifications when the price drops to your target
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="parallax absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-500/20 to-purple-500/20" data-speed="0.2"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Start{" "}
            <span className="text-yellow-300">Saving Money?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Join thousands of smart shoppers who never overpay. Start tracking prices today!
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
          >
            Create Free Account
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
