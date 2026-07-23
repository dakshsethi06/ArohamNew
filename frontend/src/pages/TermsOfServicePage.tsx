import { MAROON, GOLD, SERIF, SANS } from "@/constants/theme";

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#C8A044] selection:text-[#0D0508] pb-10">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: SERIF, color: MAROON }} className="text-4xl md:text-5xl font-medium mb-4">Terms of Service</h1>
          <div className="h-1 w-24 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          <p className="mt-6 text-sm" style={{ color: "#7A6A58" }}>Last Updated: 22 July 2026</p>
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[rgba(91,31,36,0.05)] space-y-10" style={{ color: "#4A3A2A", lineHeight: 1.8 }}>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Aroham website (<strong>aroham.in</strong>), including all content, features, and services offered on or through the Site (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you must not use the Site. We reserve the right to modify these Terms at any time, and your continued use of the Site constitutes acceptance of any such modifications.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use this Site or make a purchase. By using the Site and agreeing to these Terms, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into a binding agreement.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">3. User Accounts</h2>
            <p>
              When you create an account on our Site, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, not current, or incomplete.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">4. Products and Services</h2>
            
            <h3 className="font-semibold mt-4 mb-2" style={{ color: MAROON }}>4.1 Product Descriptions</h3>
            <p>
              We make every effort to display the colours, features, and details of our products as accurately as possible. However, we do not guarantee that the colours, dimensions, or other visual representations on your device's screen will be an exact representation of the physical product. All product descriptions are subject to change without notice.
            </p>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: MAROON }}>4.2 Energization & Spiritual Claims</h3>
            <p>
              Aroham sells spiritual and sacred products including but not limited to Rudraksha, Yantras, Gemstones, and Crystals. While these items are energized through traditional Vedic rituals (Pran Pratishtha) performed by qualified Pandits, the results and benefits attributed to these products are based on traditional beliefs and individual faith. Aroham makes <strong>no guarantees</strong> regarding specific spiritual, health, financial, or astrological outcomes from the use of any product. Our products are not intended to diagnose, treat, cure, or prevent any medical condition and are not substitutes for professional medical, legal, or financial advice.
            </p>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: MAROON }}>4.3 Pricing & Availability</h3>
            <p>
              All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated. We reserve the right to modify prices, discontinue products, or limit quantities at any time without prior notice. In the event of a pricing error, we reserve the right to cancel orders placed at the incorrect price.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">5. Orders and Payment</h2>
            <p>
              Placing an order on our Site constitutes an offer to purchase. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product or pricing information, or suspected fraudulent activity.
            </p>
            <p className="mt-3">
              Payments are processed through secure third-party payment gateways (e.g., Razorpay). We do not store your credit/debit card details on our servers. By providing your payment information, you represent that you are authorized to use the payment method.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">6. Shipping and Delivery</h2>
            <p>
              Please refer to our <a href="/shipping" style={{ color: GOLD }} className="hover:underline font-semibold">Shipping Policy</a> page for detailed information on energization timelines, estimated delivery windows, and delivery coverage. Aroham is not responsible for delays caused by third-party courier services, customs, natural disasters, or other circumstances beyond our reasonable control.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">7. Returns, Refunds, and Cancellations</h2>
            <p>
              Please refer to our <a href="/returns" style={{ color: GOLD }} className="hover:underline font-semibold">Return & Refund Policy</a> page for detailed information. In summary:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Returns are accepted within 7 days of delivery for unused items in original condition.</li>
              <li>Refunds for eligible returns will be processed within 5-7 business days to your original payment method.</li>
              <li>Custom-energized products may be exempt from return unless physically damaged in transit.</li>
              <li>Cancellation of orders is permitted before the product has been dispatched. Once shipped, the return policy applies.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">8. Intellectual Property</h2>
            <p>
              All content on this Site, including but not limited to text, graphics, logos, images, product photographs, UI design, and software, is the property of Aroham or its content suppliers and is protected by Indian and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from this Site without our prior written consent.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">9. Prohibited Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Site for any unlawful purpose or in violation of any applicable laws or regulations.</li>
              <li>Attempt to gain unauthorized access to any part of the Site, other users' accounts, or any systems or networks connected to the Site.</li>
              <li>Use automated scripts, bots, or scrapers to collect data from the Site.</li>
              <li>Submit false, misleading, or fraudulent orders or reviews.</li>
              <li>Interfere with or disrupt the integrity or performance of the Site.</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Aroham and its directors, employees, partners, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your access to or use of (or inability to access or use) the Site or Services.</li>
              <li>Any conduct or content of any third party on the Site.</li>
              <li>Any unauthorized access, use, or alteration of your transmissions or content.</li>
              <li>Any reliance on spiritual or astrological claims associated with our products.</li>
            </ul>
            <p className="mt-3">
              In no event shall our total liability to you for all claims exceed the amount you paid to Aroham for the specific product giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">11. Disclaimer of Warranties</h2>
            <p>
              The Site and all products are provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Site will be uninterrupted, timely, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Aroham and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable attorney's fees) arising from your use of the Site, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">13. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Varanasi, Uttar Pradesh, India.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable from these Terms and shall not affect the validity and enforceability of any remaining provisions.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">15. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, Shipping Policy, and Return Policy, constitute the entire agreement between you and Aroham regarding your use of the Site and supersede all prior agreements and understandings, whether written or oral.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">16. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 p-4 rounded-xl" style={{ background: "#FAF7F2" }}>
              <p><strong>Aroham</strong></p>
              <p>Email: <a href="mailto:priyanshubansal720@gmail.com" style={{ color: GOLD }} className="hover:underline">priyanshubansal720@gmail.com</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
