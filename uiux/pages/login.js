import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { signInWithGoogle, watchAuthState } from "@/lib/firebase";

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.98 10.98 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.44.34-2.1V7.06H2.18A10.98 10.98 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.98 10.98 0 0 0 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function SplashScreen({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="auth-splash">
      <div className="splash-bg" />
      <div className="splash-content">
        <div className="splash-logo-wrap">
          <div className="splash-logo-glow" />
          <div className="splash-logo">
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="2" y="2" width="36" height="36" rx="8" fill="#22c55e" />
              <path d="M12 20h6l2-6 4 12 2-6h4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h1 className="splash-title">TryonAI</h1>
        <p className="splash-sub">Premium Trading Signals</p>
        <div className="splash-loader">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label }) {
  return (
    <div className="sheet-feature">
      <span className="sheet-feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <span>{label}</span>
    </div>
  );
}

function BottomSheet({ open, onClose, onGoogleLogin, loading, error }) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setAgreed(false);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-handle" type="button" onClick={onClose} aria-label="Close">
          <span />
        </button>

        <div className="sheet-body">
          <h2 className="sheet-title">Welcome back</h2>
          <p className="sheet-sub">Sign in to TryonAI platform</p>

          <div className="sheet-features">
            <FeatureItem icon={<><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></>} label="Live Predictions" />
            <FeatureItem icon={<><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" /></>} label="Game History" />
            <FeatureItem icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>} label="Secure Access" />
          </div>

          <label className="agree-toggle">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
            <span className="agree-check" />
            <span>I agree to Terms & Privacy Policy</span>
          </label>

          <button className="gu-btn" type="button" onClick={onGoogleLogin} disabled={loading || !agreed}>
            <div className="gu-btn-inner">
              <div className="gu-btn-content">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 64 64" height="32" width="24">
                  <g fill="none" fillRule="evenodd" strokeWidth="1" stroke="none">
                    <g fillRule="nonzero" transform="translate(3.000000, 2.000000)">
                      <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267" />
                      <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667" />
                      <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782" />
                      <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769" />
                    </g>
                  </g>
                </svg>
                <span>{loading ? "Signing in..." : "Sign In with Google"}</span>
              </div>
            </div>
          </button>

          <p className="sheet-oauth-note">Secured by Google OAuth. We never store passwords.</p>

          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h0"/></svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState("splash");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let unsub = () => {};

    watchAuthState((user) => {
      if (!active) return;
      if (user) { router.replace("/"); return; }
      setChecking(false);
    }).then((fn) => { unsub = fn; }).catch(() => { if (active) setChecking(false); });

    return () => { active = false; unsub(); };
  }, [router]);

  const handleSplashComplete = useCallback(() => {
    if (checking) return;
    setStep("login");
  }, [checking]);

  async function handleGoogleLogin() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      setSheetOpen(false);
    } catch (err) {
      console.error("Google sign-in error:", err);
      const code = err?.code || "";
      if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup")) {
        setError("Sign-in cancelled. Please try again.");
      } else if (code.includes("popup-blocked")) {
        setError("Popup blocked. Please allow popups.");
      } else if (code.includes("network")) {
        setError("Network error. Check your connection.");
      } else if (code.includes("account-disabled")) {
        setError("This account is disabled.");
      } else {
        setError(err?.message || "Something went wrong.");
      }
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="login-page">
        <div className="background" />
        <div className="auth-checking">
          <div className="auth-checking-spinner" />
          <p>Checking login...</p>
        </div>
      </main>
    );
  }

  if (step === "splash") {
    return (
      <main className="login-page">
        <div className="background" />
        <SplashScreen onComplete={handleSplashComplete} />
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Login | TryonAI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <main className="login-page">
        <div className="background" />
        <div className="login-hero-image" style={{ backgroundImage: 'url(/Loginbg.jpg)' }} />

        <div className="login-bg-shapes" aria-hidden="true">
          <svg className="l-shape l-shape-1" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(21,39,254,0.07)" strokeWidth="1" /><circle cx="60" cy="60" r="30" fill="none" stroke="rgba(140,158,255,0.06)" strokeWidth="0.5" /><circle cx="60" cy="60" r="12" fill="rgba(21,39,254,0.04)" /></svg>
          <svg className="l-shape l-shape-2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(21,39,254,0.06)" strokeWidth="0.7" fill="none" /></svg>
          <svg className="l-shape l-shape-3" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(140,158,255,0.06)" strokeWidth="0.7" fill="none" /><path d="M9 12l2 2 4-4" stroke="rgba(21,39,254,0.06)" strokeWidth="0.7" fill="none" /></svg>
          <svg className="l-shape l-shape-4" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" stroke="rgba(21,39,254,0.05)" strokeWidth="0.7" fill="none" /></svg>
          <svg className="l-shape l-shape-5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m8 4l8-4m-8 4v10" stroke="rgba(140,158,255,0.06)" strokeWidth="0.7" fill="none" /></svg>
        </div>

        <span className="login-blob blob-tl" />
        <span className="login-blob blob-tr" />
        <span className="login-blob blob-bl" />
        <span className="login-blob blob-br" />
        <span className="login-dots dots-tl" />
        <span className="login-dots dots-tr" />
        <span className="login-dots dots-bl" />
        <span className="login-dots dots-br" />

        <div className="login-content-area">
          <h1 className="login-heading">Welcome Back</h1>
          <p className="login-subhead">Sign in securely with your Google account</p>

          <button className="login-btn" type="button" onClick={() => { setError(""); setSheetOpen(true); }}>
            <svg className="login-btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Login</span>
          </button>
        </div>

        <BottomSheet
          open={sheetOpen}
          onClose={() => { setSheetOpen(false); setError(""); }}
          onGoogleLogin={handleGoogleLogin}
          loading={loading}
          error={error}
        />
      </main>
    </>
  );
}
