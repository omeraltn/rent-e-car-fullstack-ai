"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setErrorMessage("E-posta adresi veya şifre hatalı.");
        } else {
          setErrorMessage("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
        }
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full flex items-center justify-center py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 xl:px-12 bg-surface">
      {/* Responsive Container Scaling Across sm, md, lg, xl, 2xl */}
      <div className="relative w-full max-w-xl md:max-w-2xl lg:max-w-6xl xl:max-w-[1220px] 2xl:max-w-[1340px]">
        {/* Subtle decorative ambient background glows */}
        <div className="absolute -top-16 -left-16 w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-secondary-fixed/35 blur-3xl pointer-events-none"></div>

        {/* Main Dual-Column Authentication Canvas */}
        <div className="relative w-full bg-surface-container-lowest rounded-2xl xl:rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:min-h-[580px] xl:min-h-[650px] 2xl:min-h-[700px] border border-outline-variant/30">
          {/* Left Column: Inspiring Automotive Visual & Brand Elevation (5 Cols) */}
          <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 xl:p-10 2xl:p-12 overflow-hidden bg-primary-container text-on-primary">
            {/* Deep rich layered gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-95 z-0"></div>
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 z-0 scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1400&q=85')",
              }}
            ></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-on-primary/10 bg-on-primary/5 blur-sm z-0"></div>

            {/* Top Brand Crest & Badge */}
            <div className="relative z-10 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-on-primary/15 backdrop-blur-md self-start">
                <span className="material-symbols-outlined text-sm xl:text-base text-secondary-fixed">
                  verified_user
                </span>
                <span className="font-label-xs text-xs tracking-wider uppercase text-on-primary font-bold">
                  Doğrulanmış Filo Erişimi
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl lg:text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mt-2 text-on-primary">
                Morent ile yolculuğunuzu başlatın.
              </h2>
              <p className="font-body-md text-sm xl:text-base text-on-primary-container leading-relaxed max-w-sm">
                Anında rezervasyon, sıfır depozito seçenekleri ve 7/24 öncelikli yol yardımı ile premium araç kiralama deneyimi.
              </p>
            </div>

            {/* Middle Showcase: Dynamic Spec Snapshot Widget */}
            <div className="relative z-10 my-6 bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-4 xl:p-6 shadow-sm border border-on-primary/15">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs text-on-primary font-bold uppercase tracking-wider">
                    Aktif Filo Durumu
                  </span>
                </div>
                <span className="text-xs text-secondary-fixed font-bold">
                  8.420+ Canlı Araç
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-surface-container-lowest/15 rounded-xl py-2.5 xl:py-3 px-2">
                  <span className="text-lg xl:text-2xl font-extrabold text-on-primary block">
                    120+
                  </span>
                  <span className="text-xs text-on-primary-container font-medium">
                    Şehir
                  </span>
                </div>
                <div className="bg-surface-container-lowest/15 rounded-xl py-2.5 xl:py-3 px-2">
                  <span className="text-lg xl:text-2xl font-extrabold text-on-primary block">
                    %99.8
                  </span>
                  <span className="text-xs text-on-primary-container font-medium">
                    Zamanında
                  </span>
                </div>
                <div className="bg-surface-container-lowest/15 rounded-xl py-2.5 xl:py-3 px-2">
                  <span className="text-lg xl:text-2xl font-extrabold text-on-primary block">
                    4.9 ★
                  </span>
                  <span className="text-xs text-on-primary-container font-medium">
                    Puan
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Quote / Social Proof Testimonial */}
            <div className="relative z-10 pt-4 border-t border-on-primary/15 flex items-center gap-4">
              <div className="relative flex -space-x-2">
                <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full ring-2 ring-primary-container bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
                  MK
                </div>
                <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full ring-2 ring-primary-container bg-secondary-container flex items-center justify-center text-on-secondary font-bold text-xs">
                  SY
                </div>
                <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full ring-2 ring-primary-container bg-secondary flex items-center justify-center text-on-secondary font-bold text-xs">
                  +45k
                </div>
              </div>
              <div>
                <p className="text-xs xl:text-sm font-bold text-on-primary">
                  45.000+ sürücünün tercihi
                </p>
                <p className="text-xs text-secondary-fixed">
                  3 dakikada hızlı anahtar teslimatı.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Core Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 xl:p-12 2xl:p-14 flex flex-col justify-center bg-surface-container-lowest">
            <div className="w-full max-w-md sm:max-w-lg xl:max-w-xl mx-auto flex flex-col justify-center">
              {/* Header Area */}
              <div className="mb-5 xl:mb-6">
                <div className="flex items-center gap-1.5 text-primary mb-1.5">
                  <span className="material-symbols-outlined text-lg xl:text-xl">key</span>
                  <span className="font-label-sm text-xs xl:text-sm font-bold uppercase tracking-wider text-primary">
                    Üye Portalı
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl xl:text-4xl font-extrabold text-on-surface tracking-tight">
                  Tekrar Hoş Geldiniz
                </h1>
                <p className="font-body-md text-xs sm:text-sm xl:text-base text-on-surface-variant mt-1.5 leading-relaxed">
                  Rezervasyonlarınızı yönetmek, kiralama geçmişinizi incelemek ve özel üye fiyatlarına erişmek için giriş yapın.
                </p>
              </div>

              {/* Error Message Banner */}
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-error-container text-on-error-container text-xs sm:text-sm flex items-center gap-2.5 border border-error/20">
                  <span className="material-symbols-outlined text-error text-lg shrink-0">
                    error
                  </span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick Social Login: Google Action */}
              <div className="flex flex-col gap-2 mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  aria-label="Google ile Giriş Yap"
                  className="w-full h-10 sm:h-11 xl:h-12 flex items-center justify-center gap-3 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-semibold text-xs sm:text-sm xl:text-base rounded-xl shadow-xs hover:shadow-sm border border-outline-variant/40 transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  <svg aria-hidden="true" className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  <span>Google ile Devam Et</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3.5 xl:my-4">
                <div className="w-full h-px bg-surface-container-high"></div>
                <span className="absolute px-4 bg-surface-container-lowest text-xs text-outline">
                  Veya e-posta ile giriş yapın
                </span>
              </div>

              {/* Main Input Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 xl:gap-4">
                {/* Email Input Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="email">
                    E-posta Adresi
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-lg xl:text-xl text-outline pointer-events-none">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adiniz@example.com"
                      required
                      className="w-full h-10 sm:h-11 xl:h-12 pl-11 pr-4 bg-surface-container-low hover:bg-surface-container focus:bg-surface-container-lowest text-on-surface text-xs sm:text-sm xl:text-base rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input Field with Interactive Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="password">
                    Şifre
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-lg xl:text-xl text-outline pointer-events-none">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifrenizi girin"
                      required
                      className="w-full h-10 sm:h-11 xl:h-12 pl-11 pr-11 bg-surface-container-low hover:bg-surface-container focus:bg-surface-container-lowest text-on-surface text-xs sm:text-sm xl:text-base rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Şifre görünürlüğünü değiştir"
                      className="absolute right-3 p-1.5 text-outline hover:text-on-surface rounded-md transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg xl:text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Form Utilities: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-container focus:ring-primary-container bg-surface-container cursor-pointer accent-primary-container"
                    />
                    <span className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface">
                      Beni hatırla
                    </span>
                  </label>
                  <Link
                    href="#"
                    className="text-xs sm:text-sm text-primary-container hover:text-primary transition-colors focus:outline-none focus:underline font-semibold"
                  >
                    Şifremi Unuttum?
                  </Link>
                </div>

                {/* Primary Submission CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 sm:h-11 xl:h-12 mt-1 bg-primary-container hover:bg-secondary-container active:scale-[0.99] text-on-primary text-xs sm:text-sm xl:text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Giriş Yapılıyor...</span>
                    </div>
                  ) : (
                    <>
                      <span>Giriş Yap</span>
                      <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Register Referral Footer */}
              <div className="text-center mt-5 pt-2">
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Henüz bir hesabınız yok mu?
                  <Link
                    href="/register"
                    className="text-primary-container hover:text-primary font-bold transition-colors focus:outline-none focus:underline ml-1.5"
                  >
                    Hemen Kayıt Olun
                  </Link>
                </p>
              </div>

              {/* Security Badges & Trust Footer */}
              <div className="mt-4 pt-3.5 border-t border-surface-container flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-outline">
                <div className="flex items-center gap-1.5 text-[11px] xl:text-xs tracking-wider uppercase font-semibold">
                  <span className="material-symbols-outlined text-base text-primary">
                    lock_clock
                  </span>
                  <span>256-bit SSL Güvenliği</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
                <div className="flex items-center gap-1.5 text-[11px] xl:text-xs tracking-wider uppercase font-semibold">
                  <span className="material-symbols-outlined text-base text-primary">
                    verified
                  </span>
                  <span>Onaylı Araç Kiralama Ağı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
