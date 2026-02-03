import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E8DCC4]">
      <Navbar />
      
      <main className="grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-[#6B9B8E] font-semibold">
              Have a question? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white border-4 border-black p-8 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-[#F4A460]">
                Send us a message
              </h2>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-500 border-4 border-black text-white font-bold drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thank you! We'll get back to you soon.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E]"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E]"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#F4A460] text-white border-2 border-black font-bold hover:bg-[#E89450] transition-colors drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white border-4 border-black p-8 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-[#F4A460]">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="shrink-0 w-12 h-12 bg-[#F4A460] flex items-center justify-center border-2 border-black">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Email</h3>
                      <p className="text-gray-600 mt-1 font-medium">support@smartpricetracker.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="shrink-0 w-12 h-12 bg-[#6B9B8E] flex items-center justify-center border-2 border-black">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Address</h3>
                      <p className="text-gray-600 mt-1 font-medium">
                        123 Tech Street<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="shrink-0 w-12 h-12 bg-[#F4A460] flex items-center justify-center border-2 border-black">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600 mt-1 font-medium">
                        Monday - Friday: 9AM - 6PM PST<br />
                        Weekend: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#6B9B8E] border-4 border-black p-8 text-white drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-bold mb-4">
                  Need Immediate Help?
                </h3>
                <p className="mb-6 font-medium">
                  Check out our FAQ section or browse our help documentation for quick answers.
                </p>
                <button className="px-6 py-3 bg-white text-[#6B9B8E] font-bold hover:bg-[#E8F4F1] transition-colors border-2 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                  Visit Help Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
