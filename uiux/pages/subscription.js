import Head from "next/head";
import { useState } from "react";

const bgStyle = `html, body { background: #f8fafc !important; overflow: auto !important; } #__next { height: auto; min-height: 100vh; overflow: auto; }`;

export default function Subscription() {
  const [showPayment, setShowPayment] = useState(false);
  const [utr, setUtr] = useState("");
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <Head>
        <title>Subscription - TryonAI</title>
        <style dangerouslySetInnerHTML={{ __html: bgStyle }} />
      </Head>
      <div className="grid-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="grid-background" />
        <div className="card" style={showPayment ? { display: "none" } : {}}>
          <div className="card-pattern-grid"></div>
          <div className="card-overlay-dots"></div>

          <div className="bold-pattern">
            <svg viewBox="0 0 100 100">
              <path
                strokeDasharray="15 10"
                strokeWidth="10"
                stroke="#000"
                fill="none"
                d="M0,0 L100,0 L100,100 L0,100 Z"
              ></path>
            </svg>
          </div>

          <div className="card-title-area">
            <span>PREMIUM PLANE</span>
            <span className="card-tag">paid</span>
          </div>

          <div className="card-body">
            <div className="card-description">
              Our 3-Level fix win prediction Policy is designed to give users added confidence. If all three prediction levels fail, a refund is available according to our refund terms. We are committed to transparency, fairness, and providing the best possible experience for every subscriber.
            </div>

            <div className="feature-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M20,4C21.1,4 22,4.9 22,6V18C22,19.1 21.1,20 20,20H4C2.9,20 2,19.1 2,18V6C2,4.9 2.9,4 4,4H20M4,6V18H20V6H4M6,9H18V11H6V9M6,13H16V15H6V13Z"
                    ></path>
                  </svg>
                </div>
                <span className="feature-text">3-Level Strategy</span>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M4.07,3H19.93L18.5,19.2L12,21L5.5,19.2L4.07,3Z"
                    ></path>
                  </svg>
                </div>
                <span className="feature-text">Sure-Shot Signal</span>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"
                    ></path>
                  </svg>
                </div>
                <span className="feature-text">High Accuracy Performance</span>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M9.19,6.35C8.41,7.13 7.75,8.05 7.25,9H5V11H7.12C7.05,11.32 7,11.66 7,12C7,12.34 7.05,12.68 7.12,13H5V15H7.25C7.75,15.95 8.41,16.87 9.19,17.65L7.77,19.07L9.88,21.18L11.3,19.77C11.85,20.03 12.41,20.2 13,20.31V23H15V20.31C15.59,20.2 16.15,20.03 16.7,19.77L18.12,21.18L20.23,19.07L18.81,17.65C19.59,16.87 20.25,15.95 20.75,15H23V13H20.88C20.95,12.68 21,12.34 21,12C21,11.66 20.95,11.32 20.88,11H23V9H20.75C20.25,8.05 19.59,7.13 18.81,6.35L20.23,4.93L18.12,2.82L16.7,4.23C16.15,3.97 15.59,3.8 15,3.69V1H13V3.69C12.41,3.8 11.85,3.97 11.3,4.23L9.88,2.82L7.77,4.93L9.19,6.35M13,17A5,5 0 0,1 8,12A5,5 0 0,1 13,7A5,5 0 0,1 18,12A5,5 0 0,1 13,17Z"
                    ></path>
                  </svg>
                </div>
                <span className="feature-text">Wingo 30-Second Expert Predictions</span>
              </div>
            </div>

            <div className="card-actions">
              <div className="price">
                <span className="price-currency">$</span>799
                <span className="price-period">Limited</span>
              </div>

              <button className="card-button" onClick={() => setShowPayment(true)}>Get Started</button>
            </div>
          </div>

          <div className="dots-pattern">
            <svg viewBox="0 0 80 40">
              <circle fill="#000" r="3" cy="10" cx="10"></circle>
              <circle fill="#000" r="3" cy="10" cx="30"></circle>
              <circle fill="#000" r="3" cy="10" cx="50"></circle>
              <circle fill="#000" r="3" cy="10" cx="70"></circle>
              <circle fill="#000" r="3" cy="20" cx="20"></circle>
              <circle fill="#000" r="3" cy="20" cx="40"></circle>
              <circle fill="#000" r="3" cy="20" cx="60"></circle>
              <circle fill="#000" r="3" cy="30" cx="10"></circle>
              <circle fill="#000" r="3" cy="30" cx="30"></circle>
              <circle fill="#000" r="3" cy="30" cx="50"></circle>
              <circle fill="#000" r="3" cy="30" cx="70"></circle>
            </svg>
          </div>

          <div className="accent-shape"></div>
          <div className="corner-slice"></div>

          <div className="stamp">
            <span className="stamp-text">Approved</span>
          </div>
        </div>

        {showPayment && (
          <div className="payment-overlay">
            <div className="payment-modal">
              <button className="payment-close" onClick={() => setShowPayment(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>

              <div className="payment-header">
                <div className="payment-lock-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <h2 className="payment-title">Secure Your Premium Access</h2>
                <p className="payment-subtitle">Complete your payment to unlock instant access to all premium features, exclusive signals, and 24/7 expert support. Your transaction is 100% secure and encrypted.</p>
              </div>

              <div className="payment-qr-wrap">
                <div className="payment-qr-blob"></div>
                <div className="payment-qr-bg">
                  <img src="/799qr.jpg" alt="Payment QR Code" className="payment-qr" />
                </div>
              </div>

              <div className="payment-upi-apps">
                <span className="payment-upi-label">Pay with your preferred UPI app</span>
                <div className="payment-upi-icons">
                  <div className="upi-icon" title="Google Pay">
                    <img src="/google-pay-logo.webp" alt="Google Pay" className="upi-img" />
                    <span>Google Pay</span>
                  </div>
                  <div className="upi-icon" title="Paytm">
                    <img src="/paytm-india-logo.webp" alt="Paytm" className="upi-img" />
                    <span>Paytm</span>
                  </div>
                  <div className="upi-icon" title="PhonePe">
                    <img src="/phonepe-india-logo.webp" alt="PhonePe" className="upi-img" />
                    <span>PhonePe</span>
                  </div>
                  <div className="upi-icon" title="Amazon Pay">
                    <svg viewBox="0 0 120 48" width="60" height="24">
                      <rect x="2" y="2" width="116" height="44" rx="8" fill="white" stroke="#ddd" strokeWidth="0.5"/>
                      <path d="M34 16h-4v8h-2v-8h-4v-2h10v2z" fill="#FF9900"/>
                      <path d="M42 14c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="#FF9900"/>
                      <path d="M50 14h2v6l3-3h2.5l-3 3 3 3H55l-3-3v3h-2v-9z" fill="#FF9900"/>
                      <path d="M60 14h2v1.5c.5-.9 1.3-1.5 2.3-1.5.7 0 1.3.2 1.7.6.4.4.7 1 .7 1.8V22h-2v-4.5c0-.7-.3-1-.8-1-.5 0-.9.3-1.2.8V22h-2v-8h-.7z" fill="#FF9900"/>
                      <path d="M76 24c-2.8 0-5-1.6-5-4h2c0 1.3 1.3 2.3 3 2.3s3-1 3-2.3-1.3-2.3-3-2.3h-1v-2h1c1.3 0 2.5-.8 2.5-2s-.8-1.7-2-1.7c-1.1 0-2 .7-2.3 1.7h-2c.3-2 2-3.3 4.3-3.3 2.3 0 4 1.3 4 3 0 1.3-.8 2.3-2 2.7 1.3.3 2.3 1.3 2.3 2.7 0 2.2-2 3.9-5 3.9z" fill="#FF9900"/>
                      <text x="90" y="25" textAnchor="middle" fill="#FF9900" fontSize="10" fontWeight="bold" fontFamily="Arial">pay</text>
                    </svg>
                    <span>Amazon Pay</span>
                  </div>
                  <div className="upi-icon" title="Super Pay">
                    <img src="/super-app-logo-india.webp" alt="Super Pay" className="upi-img" />
                    <span>Super Pay</span>
                  </div>
                </div>
              </div>

              <div className="payment-utr">
                <label className="payment-utr-label">Enter your 12-digit UTR Number</label>
                <div className="payment-utr-input-wrap">
                  <svg viewBox="0 0 24 24" width="20" height="20" className="payment-utr-icon">
                    <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h12v2H6zm0 3h10v2H6z"/>
                  </svg>
                  <input
                    type="text"
                    className="payment-utr-input"
                    placeholder="e.g. HDFC123456789"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    maxLength={30}
                  />
                </div>
              </div>

              <button className="relative flex items-center px-6 py-3 overflow-hidden font-medium transition-all bg-indigo-500 rounded-md group w-full justify-center" onClick={() => {
                setShowToast(true);
                const msg = encodeURIComponent(`Hello Admin, I have submitted the payment request on the website.\nPlan: PRO PLANS (₹799)\nUTR ID: ${utr}\nPlease verify and activate my Wingo Signals Premium access now. Thanks!`);
                window.open(`https://t.me/kal_mods?text=${msg}`, '_blank');
                setTimeout(() => setShowToast(false), 3000);
              }}>
                <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-mr-4 group-hover:-mt-4">
                  <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                </span>
                <span className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-ml-4 group-hover:-mb-4">
                  <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                </span>
                <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-indigo-600 rounded-md group-hover:translate-x-0"></span>
                <span className="relative w-full text-center text-white transition-colors duration-200 ease-in-out group-hover:text-white">Submit UTR</span>
              </button>

              {showToast && (
                <>
                  <div className="payment-toast-overlay" onClick={() => setShowToast(false)} />
                  <div className="payment-toast">
                    <svg width="16" height="96" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 8 0 Q 4 4.8, 8 9.6 T 8 19.2 Q 4 24, 8 28.8 T 8 38.4 Q 4 43.2, 8 48 T 8 57.6 Q 4 62.4, 8 67.2 T 8 76.8 Q 4 81.6, 8 86.4 T 8 96 L 0 96 L 0 0 Z" fill="#66cdaa" stroke="#66cdaa" strokeWidth="2" strokeLinecap="round"></path>
                    </svg>
                    <div className="payment-toast-body">
                      <p className="payment-toast-title">Success !</p>
                      <p className="payment-toast-msg">hey!<br />PROCESSING YOUR UTR</p>
                    </div>
                    <button className="payment-toast-close" onClick={() => setShowToast(false)}>
                      <svg className="w-7 h-7" fill="none" stroke="mediumseagreen" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}

              <div className="payment-guide">
                <h3 className="payment-guide-title">Payment Guide</h3>
                <p className="payment-guide-sub">How to pay via UPI</p>

                <div className="payment-step">
                  <div className="payment-step-num">1</div>
                  <div className="payment-step-content">
                    <strong>Scan QR or tap a UPI app</strong>
                    <p>Open your preferred UPI app and scan the QR code, or tap the app icon to auto-fill payment details.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-num">2</div>
                  <div className="payment-step-content">
                    <strong>Complete the payment</strong>
                    <p>Pay the exact invoice amount to <span className="payment-upi-id">data-earn@ybl</span>. Your UPI app will show a confirmation screen after success.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-num">3</div>
                  <div className="payment-step-content">
                    <strong>Submit your 12-digit UTR</strong>
                    <p>Copy the UTR (transaction reference) from your payment receipt and paste it in the form. Our system verifies and activates your license automatically.</p>
                  </div>
                </div>

                <div className="payment-support">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                  </svg>
                  <span>Need help with payment? Contact our support team — we are available 24/7.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
