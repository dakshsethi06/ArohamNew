import { MAROON, GOLD, SERIF, SANS } from "@/constants/theme";

export function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#C8A044] selection:text-[#0D0508] pb-10">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: SERIF, color: MAROON }} className="text-4xl md:text-5xl font-medium mb-4">Return & Refund Policy</h1>
          <div className="h-1 w-24 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[rgba(91,31,36,0.05)] space-y-8" style={{ color: "#4A3A2A" }}>
          
          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">1. 7-Day Return Window</h2>
            <p className="leading-relaxed">
              We stand by the authenticity and quality of our sacred products. If you are not completely satisfied, you may initiate a return within <strong>7 days</strong> of receiving your delivery.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">2. Conditions for Return</h2>
            <p className="leading-relaxed">
              To be eligible for a return or replacement, the following conditions must be strictly met:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>The item must be unused and in the exact condition you received it.</li>
              <li>All original tags, packaging, and the Certificate of Authenticity (Lab Certificate) must be intact and returned with the product.</li>
              <li>The sacred item must not have been physically altered, broken, or improperly handled by the user.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">3. Damaged or Defective Goods</h2>
            <p className="leading-relaxed">
              If your product arrives damaged or defective due to transit, we require a <strong>continuous unboxing video</strong> as proof. 
              Because our items are high-value and uniquely energized, this standard practice helps us process your replacement immediately without dispute. 
              Please email the video to <a href="mailto:priyanshubansal720@gmail.com" style={{ color: GOLD }} className="hover:underline">priyanshubansal720@gmail.com</a> within 24 hours of delivery.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">4. Custom Energized Products</h2>
            <p className="leading-relaxed">
              Some specific products that undergo highly personalized, multi-day rituals based on your exact Kundali (birth chart) may be exempt from standard returns unless they arrive physically damaged. This will be explicitly stated on the product page if applicable.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">5. Refund Processing</h2>
            <p className="leading-relaxed">
              Once your returned item is received and inspected at our spiritual center, we will send you an email to notify you of the approval or rejection of your refund. 
              If approved, the refund will be processed and credited back to your original method of payment within 5-7 business days.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
