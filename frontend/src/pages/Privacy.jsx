import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8DCC4]">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-[#6B9B8E] font-semibold">
              Your privacy is important to us
            </p>
          </div>
          
          <div className="bg-white border-4 border-black p-8 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Account information (name, email, password)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Product tracking preferences and alerts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Usage data and analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Communication preferences</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">
                We use the information we collect to:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Provide and maintain our price tracking services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Send you price alerts and notifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Improve and personalize your experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Communicate with you about updates and features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Analyze usage patterns to enhance our service</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                3. Information Sharing
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="space-y-2 ml-4 mt-3">
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">With your consent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">To comply with legal obligations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">To protect our rights and prevent fraud</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">With service providers who assist in our operations</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                4. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                5. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                6. Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3 font-medium">
                You have the right to:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Access and receive a copy of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Correct inaccurate or incomplete data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Request deletion of your data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Opt-out of marketing communications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4A460] mr-2 font-bold">▸</span>
                  <span className="text-gray-700">Lodge a complaint with a supervisory authority</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                7. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#F4A460]">
                9. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed font-medium">
                If you have any questions about this Privacy Policy, please contact us through our Contact page.
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

export default Privacy;
