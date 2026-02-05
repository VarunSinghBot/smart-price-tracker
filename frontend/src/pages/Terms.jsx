import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8DCC4]">
      <Navbar />
      
      <main className="grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl text-[#6B9B8E] font-semibold">
              Please read these terms carefully
            </p>
          </div>
          
          <div className="bg-white border-4 border-black p-8 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                By accessing and using Smart Price Tracker ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                2. Description of Service
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                Smart Price Tracker provides price tracking and comparison services for various online retailers. We monitor product prices and send alerts when prices change based on user preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                3. User Accounts
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Provide accurate and complete information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Maintain the security of your password</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Accept responsibility for all activities under your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Notify us immediately of any unauthorized use</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                4. Acceptable Use
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">
                You agree not to:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Use the Service for any illegal purpose</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Attempt to gain unauthorized access to any portion of the Service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Interfere with or disrupt the Service or servers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Use automated systems to access the Service excessively</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                5. Price Accuracy
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                While we strive to provide accurate price information, we cannot guarantee that all prices displayed are current or error-free. Users should verify prices directly with retailers before making purchases.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                Smart Price Tracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                7. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                8. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                If you have any questions about these Terms & Conditions, please contact us through our Contact page.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t-4 border-black bg-[#E8F4F1] p-4">
              <p className="text-sm font-bold text-gray-800">
                Last Updated: January 12, 2026
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Terms;
