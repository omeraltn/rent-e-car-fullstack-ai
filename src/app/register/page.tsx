"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgree, setTermsAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate password strength (0 to 4)
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Zayıf", "Orta", "İyi", "Çok Güçlü"];
  const isMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!termsAgree) {
      setErrorMessage("Lütfen kullanım şartlarını ve gizlilik politikasını onaylayın.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Kayıt işlemi sırasında bir hata oluştu.");
        setIsLoading(false);
        return;
      }

      // Auto login with credentials after successful registration
      const loginRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      console.error("Register error:", err);
      setErrorMessage("Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full flex items-center justify-center py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 xl:px-12 bg-surface">
      {/* Responsive Container Scaling Across sm, md, lg, xl, 2xl */}
      <div className="relative w-full max-w-xl md:max-w-2xl lg:max-w-6xl xl:max-w-[1220px] 2xl:max-w-[1340px]">
        {/* Subtle decorative ambient background glows */}
        <div className="absolute -top-16 -left-16 w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>

        {/* Main Dual-Column Authentication Canvas */}
        <div className="relative w-full bg-surface-container-lowest rounded-2xl xl:rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:min-h-[600px] xl:min-h-[660px] 2xl:min-h-[700px] border border-outline-variant/30">
          {/* Left Benefit / Visual Showcase Panel (5 Cols) */}
          <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 xl:p-10 2xl:p-12 overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary">
            {/* Background Ambience */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-surface-tint/30 blur-3xl pointer-events-none"></div>

            {/* Header area within panel */}
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-on-primary/15 backdrop-blur-md text-on-primary font-label-xs text-xs uppercase tracking-wider font-bold">
                <span className="material-symbols-outlined text-sm text-secondary-fixed">
                  stars
                </span>
                Morent Club Ayrıcalıkları
              </div>

              <h2 className="font-display text-2xl lg:text-3xl xl:text-4xl font-extrabold text-on-primary tracking-tight leading-tight mt-1">
                Morent Club&apos;a <br />
                Katılın.
              </h2>
              <p className="font-body-md text-sm xl:text-base text-on-primary-container leading-relaxed max-w-sm">
                Temassız teslimat, seçkin premium filo ve 120+ noktada garantili en iyi kiralama fiyatları.
              </p>
            </div>

            {/* Dynamic Vehicle Stage Showcase Card */}
            <div className="relative z-10 my-4 rounded-2xl overflow-hidden shadow-xl bg-surface-container-lowest/10 backdrop-blur-md p-4 xl:p-5 border border-on-primary/15">
              <div className="flex items-center justify-between pb-2.5">
                <div>
                  <span className="text-[11px] text-primary-fixed uppercase tracking-wider block font-bold">
                    Öne Çıkan Kulüp Aracı
                  </span>
                  <span className="text-base xl:text-lg text-on-primary font-bold">
                    Porsche Taycan 4S Cross
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed">
                  Anında Anahtar
                </span>
              </div>

              <div className="relative h-32 xl:h-40 2xl:h-44 w-full rounded-xl overflow-hidden my-1.5 group">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=85')",
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-on-primary text-xs">
                  <span className="opacity-95 font-medium">0-100 km/s: 3.8s · AWD</span>
                  <span className="font-bold text-primary-fixed">Üye: $149/gün</span>
                </div>
              </div>

              {/* Fast-track perks row */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="bg-on-primary/10 rounded-xl py-2 px-1.5">
                  <span className="material-symbols-outlined text-primary-fixed block text-base xl:text-lg">
                    electric_bolt
                  </span>
                  <span className="text-[11px] xl:text-xs text-on-primary font-semibold">
                    Dijital Anahtar
                  </span>
                </div>
                <div className="bg-on-primary/10 rounded-xl py-2 px-1.5">
                  <span className="material-symbols-outlined text-primary-fixed block text-base xl:text-lg">
                    flight_takeoff
                  </span>
                  <span className="text-[11px] xl:text-xs text-on-primary font-semibold">
                    Hızlı Teslim
                  </span>
                </div>
                <div className="bg-on-primary/10 rounded-xl py-2 px-1.5">
                  <span className="material-symbols-outlined text-primary-fixed block text-base xl:text-lg">
                    verified_user
                  </span>
                  <span className="text-[11px] xl:text-xs text-on-primary font-semibold">
                    Tam Kasko
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial / Social Proof Footer inside Card */}
            <div className="relative z-10 pt-3.5 border-t border-on-primary/15 flex items-center justify-between gap-3">
              <div className="flex items-center -space-x-2">
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-surface-container-high ring-2 ring-on-primary overflow-hidden flex items-center justify-center text-primary font-bold text-xs">
                  MK
                </div>
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-secondary-container ring-2 ring-on-primary overflow-hidden flex items-center justify-center text-on-primary font-bold text-xs">
                  SL
                </div>
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-tertiary ring-2 ring-on-primary overflow-hidden flex items-center justify-center text-on-primary font-bold text-xs">
                  JR
                </div>
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-primary-fixed ring-2 ring-on-primary flex items-center justify-center text-on-primary-fixed text-xs font-bold">
                  +45k
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-0.5 text-secondary-fixed">
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                </div>
                <p className="text-xs text-on-primary-container font-medium">
                  4.9/5 · 45.000+ mutlu sürücü
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Registration Container (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 lg:p-10 xl:p-12 2xl:p-14 flex flex-col justify-center">
            <div className="w-full max-w-md sm:max-w-lg xl:max-w-xl mx-auto flex flex-col justify-center">
              {/* Form Header */}
              <div className="flex flex-col gap-1 mb-4 xl:mb-5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-xs xl:text-sm uppercase tracking-wider text-primary font-bold">
                    Hızlı & Kolay Kayıt
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full font-semibold">
                    1 Dakikada Hesap Açın
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl xl:text-4xl font-extrabold text-on-surface tracking-tight">
                  Hesap Oluşturun
                </h1>
                <p className="font-body-md text-xs sm:text-sm xl:text-base text-on-surface-variant">
                  Morent ile dakikalar içinde sorunsuz araç kiralama deneyimine adım atın.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-3.5 p-3 rounded-xl bg-error-container text-on-error-container text-xs sm:text-sm flex items-center gap-2.5 border border-error/20">
                  <span className="material-symbols-outlined text-error text-lg shrink-0">
                    error
                  </span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Google Single Sign-On Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full h-10 sm:h-11 xl:h-12 flex items-center justify-center gap-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-on-surface shadow-xs active:scale-[0.99] border border-outline-variant/40 cursor-pointer disabled:opacity-60 text-xs sm:text-sm xl:text-base font-semibold"
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
                <span>Google ile Kayıt Olun</span>
              </button>

              {/* Divider with Text */}
              <div className="relative flex items-center justify-center my-3 xl:my-4">
                <div className="w-full h-px bg-surface-container-high"></div>
                <span className="absolute px-3.5 bg-surface-container-lowest text-xs text-outline">
                  Veya e-posta ile kayıt olun
                </span>
              </div>

              {/* Form Elements (2-Column Smart Grid for Balanced Desktop Scaling & Viewport Fit) */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 xl:gap-4">
                {/* Row 1: Name & Surname (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="firstName">
                      Adınız
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-lg xl:text-xl">
                        badge
                      </span>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ahmet"
                        required
                        className="w-full h-10 sm:h-11 xl:h-11.5 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs sm:text-sm xl:text-base placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="lastName">
                      Soyadınız
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-lg xl:text-xl">
                        person
                      </span>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Yılmaz"
                        required
                        className="w-full h-10 sm:h-11 xl:h-11.5 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs sm:text-sm xl:text-base placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email & Phone (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="regEmail">
                      E-posta Adresi
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-lg xl:text-xl">
                        mail
                      </span>
                      <input
                        id="regEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="adiniz@example.com"
                        required
                        className="w-full h-10 sm:h-11 xl:h-11.5 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs sm:text-sm xl:text-base placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="regPhone">
                      Telefon Numarası
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-lg xl:text-xl">
                        call
                      </span>
                      <div className="absolute left-9.5 flex items-center gap-0.5 text-on-surface-variant text-xs font-semibold select-none">
                        <span>+90</span>
                        <span className="text-outline-variant">•</span>
                      </div>
                      <input
                        id="regPhone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(5XX) XXX XX XX"
                        className="w-full h-10 sm:h-11 xl:h-11.5 pl-20 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs sm:text-sm xl:text-base placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Password & Confirm Password (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="regPassword">
                      Şifre
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-lg xl:text-xl">
                        lock
                      </span>
                      <input
                        id="regPassword"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 6 karakter"
                        required
                        className="w-full h-10 sm:h-11 xl:h-11.5 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface text-xs sm:text-sm xl:text-base placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-outline hover:text-on-surface transition-colors flex items-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg xl:text-xl">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="confirmPassword">
                      Şifre Tekrar
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-lg xl:text-xl">
                        lock_reset
                      </span>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifreyi onaylayın"
                        required
                        className="w-full h-10 sm:h-11 xl:h-11.5 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface text-xs sm:text-sm xl:text-base placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      {isMatch && (
                        <span className="material-symbols-outlined absolute right-3 text-emerald-600 text-lg xl:text-xl">
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password strength indicator bars */}
                {password.length > 0 && (
                  <div className="flex items-center justify-between gap-2 -mt-1 px-0.5">
                    <div className="flex items-center gap-1.5 flex-1">
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength >= 1 ? "bg-primary-container" : "bg-surface-container-high"
                        }`}
                      ></div>
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength >= 2 ? "bg-primary-container" : "bg-surface-container-high"
                        }`}
                      ></div>
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength >= 3 ? "bg-primary-container" : "bg-surface-container-high"
                        }`}
                      ></div>
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength >= 4 ? "bg-emerald-500" : "bg-surface-container-high"
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs text-primary font-bold">
                      {strengthLabels[Math.min(strength, 3)]}
                    </span>
                  </div>
                )}

                {/* Terms and Policy Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="termsAgree"
                    checked={termsAgree}
                    onChange={(e) => setTermsAgree(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded text-primary-container focus:ring-primary border-outline-variant bg-surface-container-low cursor-pointer accent-primary"
                  />
                  <label
                    htmlFor="termsAgree"
                    className="text-xs sm:text-sm text-on-surface-variant leading-snug cursor-pointer select-none"
                  >
                    Morent&apos;in{" "}
                    <Link href="#" className="text-primary font-semibold hover:underline">
                      Kullanım Şartları
                    </Link>{" "}
                    ve{" "}
                    <Link href="#" className="text-primary font-semibold hover:underline">
                      Gizlilik Politikası
                    </Link>
                    &apos;nı okudum, kabul ediyorum.
                  </label>
                </div>

                {/* Primary Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 w-full h-10 sm:h-11 xl:h-12 px-5 rounded-xl bg-primary-container text-on-primary hover:bg-secondary-container active:scale-[0.99] text-xs sm:text-sm xl:text-base font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Hesap Oluşturuluyor...</span>
                    </div>
                  ) : (
                    <>
                      <span>Hesap Oluştur</span>
                      <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Trust Badges & Switch Prompt Footer */}
              <div className="mt-4 pt-3 border-t border-surface-container flex flex-col gap-1.5 text-center">
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Zaten bir hesabınız var mı?
                  <Link
                    href="/login"
                    className="text-primary font-bold hover:underline transition-colors ml-1.5"
                  >
                    Giriş Yapın
                  </Link>
                </p>
                <div className="flex items-center justify-center gap-4 text-outline text-[11px] xl:text-xs font-semibold pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">
                      verified
                    </span>
                    Anında doğrulama
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">
                      lock
                    </span>
                    256-bit SSL Güvenliği
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
