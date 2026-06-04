import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const isHindi = currentLang === 'hi';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-24 bg-white relative">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline mb-6">
        <ArrowLeft size={14} /> {isHindi ? 'मुख्य पृष्ठ पर वापस जाएँ' : 'Back to Home'}
      </Link>

      <div className="p-6 md:p-10 bg-white border border-slate-200/80 rounded-3xl shadow-xl flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 flex-wrap">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex justify-center items-center text-blue-600">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800">
              {isHindi ? 'नियम और शर्तें / Terms & Conditions' : 'Terms & Conditions'}
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
              नितेश कम्युनिकेशन्स (Nitesh Communications) की वेबसाइट का उपयोग करने के लिए आपका स्वागत है। इस वेबसाइट का उपयोग करके, आप निम्नलिखित नियमों और शर्तों का पूर्ण रूप से पालन करने के लिए सहमत होते हैं। कृपया इन्हें ध्यान से पढ़ें।
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">1. सामान्य शर्तें (General Terms)</h2>
              <p>
                यह वेबसाइट केवल वैध व्यक्तिगत उपयोग के लिए है। हम किसी भी समय बिना पूर्व सूचना के इन नियमों व शर्तों को बदलने का अधिकार सुरक्षित रखते हैं। वेबसाइट का उपयोग जारी रखना आपके नए नियमों को स्वीकार करने का संकेत माना जाएगा।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">2. उपयोगकर्ता पंजीकरण (User Account & Security)</h2>
              <p>
                ऑर्डर देने या सेवा का लाभ उठाने के लिए पंजीकरण के दौरान दी गई जानकारी (जैसे नाम, फोन नंबर, पता) पूरी तरह से सही और अद्यतित होनी चाहिए। अपने खाते की क्रेडेंशियल की गोपनीयता बनाए रखना उपयोगकर्ता की ज़िम्मेदारी है।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">3. उत्पाद और मूल्य निर्धारण (Products & Pricing)</h2>
              <p>
                हम उत्पादों की जानकारी और कीमतों को यथासंभव सटीक रखने का प्रयास करते हैं। यदि किसी तकनीकी त्रुटि के कारण गलत कीमत पर ऑर्डर प्लेस होता है, तो नितेश कम्युनिकेशन्स उस ऑर्डर को रद्द करने या संशोधित करने का पूरा अधिकार सुरक्षित रखता है।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">4. डिलीवरी और भुगतान शर्तें (Delivery & Payment Terms)</h2>
              <p>
                हम अपने स्टोर केंद्र से <strong>अधिकतम 15 किमी</strong> के दायरे में डिलीवरी करते हैं, जिसकी पुष्टि चेकआउट के समय ऑटोमैटिक रूप से जीपीएस लोकेशन द्वारा की जाती है। सक्रिय डिलीवरी ऑपरेशन्स का समय <strong>सुबह 9:00 बजे से शाम 6:00 बजे</strong> तक है। शाम 6:00 बजे के बाद प्राप्त होने वाले ऑर्डर अगले दिन डिलीवर किए जाएंगे। इसके अतिरिक्त, <strong>₹5,000 से अधिक</strong> के उप-योग वाले सभी ऑर्डर्स के लिए भुगतान ऑनलाइन (UPI/कार्ड) करना आवश्यक है; कैश ऑन डिलीवरी (COD) केवल ₹5,000 या उससे कम के ऑर्डर्स के लिए ही उपलब्ध है।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">5. सेवाएं और बुकिंग (Services Booking)</h2>
              <p>
                जन सेवा केंद्र (CSC) और मोबाइल रिपेयरिंग के लिए की गई पूछताछ या बुकिंग प्रारंभिक हैं। वास्तविक शुल्क निदान या दस्तावेज़ सत्यापन के बाद ही अंतिम माना जाएगा।
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">6. विवाद और कानून (Disputes & Governing Law)</h2>
              <p>
                इस वेबसाइट और सेवाओं से उत्पन्न होने वाले किसी भी विवाद की सुनवाई विशेष रूप से जिला न्यायालय अयोध्या, उत्तर प्रदेश (भारत) के अधिकार क्षेत्र के अंतर्गत होगी।
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">संपर्क विवरण (Contact Information)</h2>
              <p>
                यदि आपके पास हमारे नियमों और शर्तों के बारे में कोई प्रश्न हैं, तो कृपया हमसे व्हाट्सएप (+91 9125949456) या ईमेल (info.niteshcommunications@gmail.com) के माध्यम से संपर्क करें।
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-slate-600 text-sm leading-relaxed">
            <p>
              Welcome to Nitesh Communications. By accessing or using our website, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before using our services.
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">1. General Terms</h2>
              <p>
                This website is for your personal and non-commercial use. We reserve the right to modify, suspend, or discontinue any aspect of the site or services at any time without prior notice.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">2. Account Registration & Security</h2>
              <p>
                To place an order or request repairs, you must provide accurate personal information (such as name, phone number, address). You are responsible for keeping your login credentials confidential.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">3. Products & Pricing Disclaimers</h2>
              <p>
                While we strive to display accurate pricing and description of products, errors can happen. In the event of a system error listing a product at an incorrect price, Nitesh Communications reserves the right to cancel or adjust that order.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">4. Delivery & Payment Policy</h2>
              <p>
                We service orders within a <strong>maximum radius of 15 km</strong> from our physical store (Karamdanda Mod, Ayodhya), validated dynamically using browser GPS/geolocation at checkout. Active deliveries occur only between <strong>9:00 AM and 6:00 PM</strong> daily; orders placed outside this timeframe are processed for next-day dispatch. Cash on Delivery (COD) is restricted to order subtotals of <strong>₹5,000 or below</strong>. Orders exceeding ₹5,000 must be settled online during checkout.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">5. CSC & Repair Bookings</h2>
              <p>
                Inquiries or bookings made for mobile repairs and Common Service Centre (CSC) services are preliminary. Final prices and delivery times will be determined post hardware diagnostics or document review.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">6. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of Uttar Pradesh, India. Any legal disputes will be subject to the exclusive jurisdiction of the courts in Ayodhya, Uttar Pradesh.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">Contact Information</h2>
              <p>
                If you have any questions regarding these Terms & Conditions, please contact us via WhatsApp (+91 9125949456) or email at info.niteshcommunications@gmail.com.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsConditions;
