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
    <div className="min-h-screen flex flex-col overflow-hidden bg-[#E8DCC4]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#6B9B8E] text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-[#F4A460]">
                <span className="w-2 h-2 bg-white animate-pulse"></span>
                <span className="text-sm font-bold">Track Smart. Save More.</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Never Overpay Again<br />
              <span className="text-[#F4DFC8]">with Smart Price Tracking</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Monitor product prices across multiple platforms, receive instant deal alerts,
              and save money effortlessly with intelligent price monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-[#F4A460] text-white font-bold text-lg hover:bg-[#E89450] transition-all shadow-md hover:shadow-lg border-3 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
              >
                <span className="flex items-center gap-2">
                  Start Tracking Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <button
                onClick={scrollToFeatures}
                className="px-8 py-4 bg-transparent border-3 border-white text-white font-bold text-lg hover:bg-white/10 transition-all drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
              >
                Learn More
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Unlimited Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* No rounded wave divider - simple straight edge */}
        <div className="h-4 bg-[#E8DCC4]"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#E8DCC4] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#E8F4F1] text-[#6B9B8E] text-sm font-bold mb-4">
              FEATURES
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Everything You Need to<br />
              <span className="text-[#6B9B8E]">Track & Save</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to help you never overpay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border-4 border-black p-6 hover:shadow-md transition-all group hover:border-[#6B9B8E] drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-14 h-14 bg-[#E8F4F1] flex items-center justify-center mb-4 group-hover:bg-[#6B9B8E] transition-colors border-2 border-black">
                  <div className="text-[#6B9B8E] group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
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
        <div className="absolute inset-0 bg-[#FFF8DC] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#E8F4F1] text-[#6B9B8E] text-sm font-bold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Start Saving in<br />
              <span className="text-orange-600">Three Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-[#6B9B8E] text-white flex items-center justify-center text-3xl font-bold border-3 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Add Product URL
              </h3>
              <p className="text-gray-600 text-lg">
                Simply paste the product link from any online store and we'll start tracking it
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-[#F4A460] text-white flex items-center justify-center text-3xl font-bold border-3 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Set Target Price
              </h3>
              <p className="text-gray-600 text-lg">
                Choose your ideal price point and we'll monitor it around the clock
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-[#6B9B8E] text-white flex items-center justify-center text-3xl font-bold border-3 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Get Deal Alerts
              </h3>
              <p className="text-gray-600 text-lg">
                Receive instant notifications when prices drop to your target
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F4A460] text-white font-bold text-lg hover:bg-[#E89450] transition-all shadow-md border-3 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#6B9B8E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-3">10K+</div>
              <div className="text-xl text-gray-200">Active Users</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-3">₹50L+</div>
              <div className="text-xl text-gray-200">Total Savings</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold mb-3">100K+</div>
              <div className="text-xl text-gray-200">Products Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#E8DCC4] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#E8F4F1] opacity-30"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#E8F4F1] opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-gray-800">
            Ready to Start Saving Money?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-600">
            Join thousands of smart shoppers who track prices and save big on their purchases
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#F4A460] text-white font-bold text-lg hover:bg-[#E89450] transition-all shadow-md border-3 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
            >
              Create Free Account
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-3 border-black text-gray-800 font-bold text-lg hover:bg-gray-50 transition-all drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
                  