import { MAROON, GOLD, SERIF, SANS } from "@/constants/theme";

export function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#C8A044] selection:text-[#0D0508] pb-10">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: SERIF, color: MAROON }} className="text-4xl md:text-5xl font-medium mb-4">Shipping Policy</h1>
          <div className="h-1 w-24 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[rgba(91,31,36,0.05)] space-y-8" style={{ color: "#4A3A2A" }}>
          
          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">1. The Energization Process (Pran Pratishtha)</h2>
            <p className="leading-relaxed">
              Unlike standard e-commerce products, our sacred items (Rudraksha, Yantras, Gemstones) are not simply pulled from a shelf and shipped. Every physical product undergoes a strict Vedic energization process (Pran Pratishtha) tailored to your name and birth details before dispatch. 
              <br/><br/>
              Please allow <strong>2 to 3 business days</strong> for our expert Pandits to perform these authentic rituals. This step is non-negotiable, as it is what breathes life and efficacy into your sacred items.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">2. Estimated Delivery Timelines</h2>
            <p className="leading-relaxed">
              Once the energization process is complete and the product is dispatched from our spiritual center, delivery within India generally takes <strong>7 to 10 business days</strong> depending on your location.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Metro Cities:</strong> 3-5 days post-dispatch.</li>
              <li><strong>Tier 2/3 Cities:</strong> 5-8 days post-dispatch.</li>
              <li><strong>Remote Areas:</strong> Up to 10 days post-dispatch.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">3. Delivery Coverage & Logistics</h2>
            <p className="leading-relaxed">
              We offer comprehensive pan-India delivery through our trusted courier partners. Our packaging is meticulously designed to ensure your sacred items arrive in pristine, untampered condition.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">4. Cash on Delivery (COD) Rules</h2>
            <p className="leading-relaxed">
              We offer Cash on Delivery (COD) to make your experience seamless. However, please note that if a COD order is placed and subsequently rejected at the doorstep, or returned without valid reason, future orders placed by the same user account or phone number will be restricted to prepaid only. In some cases of abuse, the user may be held liable for the two-way courier charges incurred.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-3">5. Tracking Your Order</h2>
            <p className="leading-relaxed">
              As soon as your package is handed over to our courier partner, you will receive an SMS and Email containing your tracking link and Order ID. You can also track your shipment live by visiting our <a href="/track" style={{ color: GOLD }} className="hover:underline font-semibold">Track Order</a> page.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
