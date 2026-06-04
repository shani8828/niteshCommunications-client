import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
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
            <RefreshCw size={32} />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800">
              {isHindi ? 'रिफंड और कैंसलेशन / Refund & Cancellation' : 'Refund & Cancellation Policy'}
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
              नितेश कम्युनिकेशन्स में हमारा लक्ष्य ग्राहकों को सर्वोत्तम सेवाएं और उत्पाद प्रदान करना है। यदि आप अपनी खरीदारी से संतुष्ट नहीं हैं, तो कृपया निम्नलिखित नीतियों को पढ़ें।
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">1. रिटर्न और रिप्लेसमेंट पॉलिसी (Returns & Replacements)</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>स्मार्टफोन एक्सेसरीज और उत्पादों के लिए <strong>7-दिवसीय रिप्लेसमेंट/रिटर्न</strong> पॉलिसी लागू है।</li>
                <li>रिटर्न स्वीकार करने के लिए उत्पाद अप्रयुक्त (Unused), अपनी मूल पैकेजिंग, टैग और बिल के साथ होना चाहिए।</li>
                <li>यदि उत्पाद क्षतिग्रस्त (Physical damage) या टूटा हुआ प्राप्त होता है, तो कृपया डिलीवरी के 24 घंटे के भीतर हमें सूचित करें।</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">2. ऑर्डर कैंसलेशन (Order Cancellation)</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>उपयोगकर्ता ऑर्डर प्लेस करने के बाद <strong>2 घंटे</strong> के भीतर इसे रद्द कर सकते हैं, बशर्ते उत्पाद दुकान से डिस्पैच या डिलीवरी के लिए न निकला हो।</li>
                <li>एक बार ऑर्डर शिप या डिस्पैच हो जाने के बाद, इसे रद्द नहीं किया जा सकता है। ग्राहक दरवाजे पर डिलीवरी के समय ऑर्डर को अस्वीकार कर सकते हैं।</li>
                <li>यदि कोई ऑर्डर हमारी 15 किमी की डिलीवरी सीमा से बाहर पाया जाता है, तो उसे सिस्टम द्वारा स्वचालित रूप से रद्द कर दिया जाएगा और भुगतान किए जाने पर पूर्ण रिफंड जारी कर दिया जाएगा।</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">3. रिफंड पॉलिसी (Refund Process)</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>ऑनलाइन भुगतान (UPI, कार्ड) के कैंसलेशन या स्वीकृत रिटर्न के मामले में, रिफंड राशि सीधे आपके मूल भुगतान स्रोत में ट्रांसफर कर दी जाएगी।</li>
                <li>रिफंड राशि बैंक/गेटवे द्वारा संसाधित होने के बाद <strong>5 से 7 कार्य दिवसों (Working Days)</strong> के भीतर आपके खाते में क्रेडिट हो जाएगी।</li>
                <li>कैश ऑन डिलीवरी (COD) ऑर्डर्स के रिफंड के लिए, हम स्टोर क्रेडिट, गूगल पे या बैंक ट्रांसफर प्रदान करेंगे।</li>
                <li>₹5,000 से अधिक के ऑर्डर्स के लिए अनिवार्य ऑनलाइन भुगतानों के रिफंड भी सीधे मूल भुगतान स्रोत में 5 से 7 कार्य दिवसों में क्रेडिट किए जाएंगे।</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">सहायता के लिए संपर्क (Contact Support)</h2>
              <p>
                यदि आपके पास रिटर्न या रिफंड से संबंधित कोई प्रश्न हैं, तो कृपया हमारे नंबर +91 9125949456 पर व्हाट्सएप संदेश भेजें या info.niteshcommunications@gmail.com पर ईमेल करें।
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-slate-600 text-sm leading-relaxed">
            <p>
              At Nitesh Communications, our customer satisfaction is our top priority. Please read our Return, Replacement, and Cancellation policy rules carefully.
            </p>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">1. Return & Replacement Policy</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>We offer a <strong>7-day replacement/return window</strong> on most mobile accessories and product categories.</li>
                <li>To be eligible for returns, the item must be unused, in its original packaging condition, with all tags and invoice records.</li>
                <li>If you receive a defective or physically damaged item, you must report it within 24 hours of delivery.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">2. Order Cancellation</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>You can cancel your order within <strong>2 hours</strong> of booking it online, provided the item has not been dispatched from our store location.</li>
                <li>Once the order is dispatched or marked "On The Way", cancellations are not permitted. You may refuse delivery at the doorstep.</li>
                <li>Any order placed outside our 15 km delivery range will be automatically cancelled by the system, and a full refund will be processed (if paid online).</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-base font-bold text-slate-800">3. Refund Processing</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
                <li>For cancelled online orders or approved returns, the refund amount will be automatically credited back to your original source of payment.</li>
                <li>Refunds generally take <strong>5 to 7 working days</strong> to reflect in your bank account or payment app after approval.</li>
                <li>For Cash on Delivery (COD) order cancellations/returns, refund transfers will be initiated via bank transfer, GPay, or store coupon code.</li>
                <li>For orders exceeding ₹5,000 where online payment is mandated, refunds will be processed back to the original online payment source within 5 to 7 business days following cancellation approval.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 mt-4">
              <h2 className="font-heading text-base font-bold text-slate-800">Need Help?</h2>
              <p>
                For returns and refund coordination, please WhatsApp us at +91 9125949456 or mail us at info.niteshcommunications@gmail.com.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundPolicy;
