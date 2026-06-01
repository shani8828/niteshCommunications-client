import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'hi';

  const isHindi = currentLang === 'hi';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-24 bg-white relative">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline mb-6">
        <ArrowLeft size={14} /> {isHindi ? 'मुख्य पृष्ठ पर वापस जाएँ' : 'Back to Home'}
      </Link>

      <div className="p-6 md:p-10 bg-white border border-slate-200/80 rounded-3xl shadow-xl flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 flex-wrap">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex justify-center items-center text-blue-600">
            <Truck size={32} />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800">
              {isHindi ? 'शिपिंग और डिलीवरी / Shipping & Delivery' : 'Shipping & Delivery Policy'}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-semibold">
              <Calendar size={12} />
              <span>{isHindi ? 'अंतिम अपडेट: 30 मई, 2026' : 'Last Updated: May 30, 2026'}</span>
            </div>
          </div>
        </div>

        {isHindi ? (
          <div className="flex flex-col gap-6 text-slate-600 text-sm leading-relaxed">
            <p>
              नितेश कम्युनिकेशन्स मुख्य रूप से अयोध्या जिले और आसपास के क्षेत्रों में विश्वसनीय डिलीवरी सेवाएं प्रदान करता है। कृपया हमारी शिपिंग नीति को ध्यान से देखें।
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">1. डिलीवरी सीमा (Delivery Radius Limits)</h2>
              <p>
                हम अपने स्टोर केंद्र (करमडांडा मोड़, अयोध्या) से <strong>अधिकतम 15 किमी के दायरे</strong> के भीतर ही डिलीवरी की सेवाएं प्रदान करते हैं। डिलीवरी एड्रेस की रेंज की पुष्टि चेकआउट के समय ऑटोमैटिक रूप से जीपीएस कोऑर्डिनेट्स द्वारा की जाती है। यदि आपका स्थान 15 किमी की सीमा से बाहर है, तो हमारा सिस्टम ऑर्डर स्वीकार नहीं करेगा।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">2. डिलीवरी समय सीमा (Shipping Timeframe)</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>ऑर्डर तो 24 घंटे किसी भी समय स्वीकार किए जाते हैं, लेकिन डिलीवरी का संचालन केवल <strong>सुबह 9:00 बजे से शाम 6:00 बजे तक</strong> किया जाता है।</li>
                <li>यदि आपका ऑर्डर शाम 6:00 बजे के बाद प्राप्त होता है, तो उसकी डिलीवरी <strong>अगले दिन (कल)</strong> की जाएगी।</li>
                <li>दुकान के 5 किमी के भीतर के स्थानीय ऑर्डर आमतौर पर <strong>24 घंटे</strong> के भीतर डिलीवर कर दिए जाते हैं।</li>
                <li>5 किमी से 15 किमी के बीच के क्षेत्रों में डिलीवरी में <strong>1 से 2 दिन</strong> का समय लग सकता है।</li>
                <li>हमारा स्टोर रविवार को बंद रहता है, इसलिए सप्ताहांत के ऑर्डर्स सोमवार को डिलीवर होंगे।</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">3. डिलीवरी शुल्क (Delivery Charges)</h2>
              <p>
                स्टोर से <strong>5 किमी के भीतर</strong> के सभी ऑर्डर्स पर <strong>मुफ़्त होम डिलीवरी (FREE Delivery)</strong> की सुविधा है। 5 किमी से अधिक की दूरी के डिलीवरी पते के लिए दूरी के आधार पर एक मामूली डिलीवरी शुल्क लागू हो सकता है।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">4. सीमा से अधिक ऑर्डर के लिए भुगतान (Payment Limit on Orders)</h2>
              <p>
                कैश ऑन डिलीवरी (COD) का विकल्प केवल <strong>₹5,000 या उससे कम</strong> के उप-योग (Subtotal) वाले ऑर्डर के लिए ही उपलब्ध है। ₹5,000 से अधिक मूल्य के सभी ऑर्डर्स के लिए भुगतान पूरी तरह से <strong>ऑनलाइन भुगतान (UPI, कार्ड, नेट बैंकिंग)</strong> के माध्यम से करना आवश्यक है।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">5. स्टोर पिकअप विकल्प (Store Pickup Choice)</h2>
              <p>
                आप ऑनलाइन ऑर्डर प्लेस करते समय "सेल्फ पिकअप" (Self-pickup) भी चुन सकते हैं। ऑर्डर कन्फर्म होने के बाद आप सीधे हमारी दुकान से आकर अपना सामान कलेक्ट कर सकते हैं।
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">पूछताछ और सहायता (Shipping Queries)</h2>
              <p>
                डिलीवरी या ऑर्डर ट्रैकिंग से संबंधित किसी भी समस्या के समाधान के लिए, कृपया हमारे हेल्पलाइन नंबर +91 9125949456 पर कॉल करें या व्हाट्सएप पर संपर्क करें।
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-slate-600 text-sm leading-relaxed">
            <p>
              Nitesh Communications serves local deliveries across Ayodhya and neighboring locations. Please review our shipping policy guidelines.
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">1. Delivery Coverage Area</h2>
              <p>
                We service direct home deliveries within a <strong>maximum radius of 15 km</strong> from our central store point (located at Karamdanda Mod, Patkhauli Chauraha, Ayodhya - GPS Coordinates: 26.67180912854583, 82.01138986020197). Address proximity is automatically calculated using GPS coordinates at checkout. Orders placed beyond this 15 km limit will be blocked by the system.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">2. Delivery Timeframe</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>Orders are accepted 24/7 online, but active deliveries are dispatched only between <strong>9:00 AM and 6:00 PM</strong>.</li>
                <li>Orders received after 6:00 PM will be processed and dispatched the <strong>following day (tomorrow)</strong>.</li>
                <li>Local orders within a 5 km range are generally dispatched and delivered within <strong>24 hours</strong>.</li>
                <li>Orders between 5 km and 15 km radius typically reach destination within <strong>1 to 2 business days</strong>.</li>
                <li>No deliveries are scheduled on Sundays or store holidays.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">3. Shipping Charges</h2>
              <p>
                We offer <strong>FREE delivery</strong> for all locations situated within a <strong>5 km radius</strong> from our store. A nominal delivery fee may apply for orders in the 5-15 km bracket depending on distance, clearly displayed during checkout.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">4. Payment Limits & Restricted Cash on Delivery</h2>
              <p>
                Cash on Delivery (COD) is only supported for orders with a subtotal of <strong>₹5,000 or below</strong>. For order values exceeding ₹5,000, customers must complete their payment online using digital options (UPI, Net Banking, Credit/Debit cards).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">5. Store Pickup Choice</h2>
              <p>
                You can opt for self-pickup when ordering online. Once your order is ready, you can walk into our physical store at Patkhauli Chauraha to collect it directly, saving any distance delivery charges.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">Shipping Queries</h2>
              <p>
                For coordinate validation or bulk shipping inquiries, please contact us on WhatsApp (+91 9125949456) or mail us at info.niteshcommunications@gmail.com.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingPolicy;
