import React from "react";
import Link from "next/link";
import Image from "next/image";
import Form from "next/form";
import { auth, signOut } from "@/auth";

const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/048/926/084/small/silver-membership-icon-default-avatar-profile-icon-membership-icon-social-media-user-image-illustration-vector.jpg";

const NAV_LINKS = [
  { label: "Ana Sayfa", href: "/", icon: "home" },
  { label: "Araç Filosu", href: "/vehicles", icon: "directions_car" },
  { label: "Fırsatlar", href: "/vehicles?sort=price_asc", icon: "local_offer" },
];

function NavbarSearchForm() {
  return (
    <Form action="/vehicles" className="relative flex items-center w-full">
      <button
        type="submit"
        aria-label="Ara"
        className="material-symbols-outlined absolute left-3.5 text-outline hover:text-primary text-xl transition-colors cursor-pointer"
      >
        search
      </button>
      <input
        type="text"
        name="search"
        placeholder="Araç, marka veya lokasyon ara..."
        className="w-full h-11 pl-11 pr-11 rounded-full bg-surface-container-low text-on-surface placeholder:text-outline text-sm font-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
      />
      <Link
        href="/vehicles"
        title="Detaylı Filtreler"
        className="material-symbols-outlined absolute right-3 text-outline text-xl hover:text-primary transition-colors cursor-pointer"
      >
        tune
      </Link>
    </Form>
  );
}

export async function Navbar() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Centered-Left Next.js <Form> Search Bar */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-1 max-w-xl">
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
            <span className="font-headline-lg text-2xl font-black text-primary-container tracking-tight transition-transform group-hover:scale-105">
              MORENT
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md">
            <NavbarSearchForm />
          </div>
        </div>

        {/* Center: Navigation Links (Large Desktop) */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label-md text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions & Server-Authenticated User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Catalog Action Link */}
          <Link
            href="/vehicles"
            title="Araç Filosu"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-xl">
              directions_car
            </span>
          </Link>

          {/* User Auth Profile or Login/Register Buttons */}
          {session?.user ? (
            <details className="relative group">
              <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer select-none">
                <div className="relative w-9 h-9">
                  <Image
                    src={session.user.image || DEFAULT_AVATAR}
                    alt={session.user.name || "Kullanıcı"}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-container/30"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest"></span>
                </div>
                <span className="hidden xl:block font-label-md text-sm text-on-surface font-semibold max-w-[120px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
                <span className="hidden xl:inline-flex items-center justify-center group-open:rotate-180 transition-transform">
                  <span className="material-symbols-outlined text-outline text-lg leading-none">
                    expand_more
                  </span>
                </span>
              </summary>

              {/* Profile Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-container-lowest shadow-xl border border-outline-variant/30 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-surface-container">
                  <p className="font-title-md text-sm font-bold text-on-surface truncate">
                    {session.user.name}
                  </p>
                  <p className="font-body-sm text-xs text-outline truncate">
                    {session.user.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed uppercase tracking-wider">
                    {session.user.role === "admin" ? "Yönetici" : "Üye Müşteri"}
                  </span>
                </div>

                <Link
                  href="/bookings"
                  className="flex items-center gap-2 px-4 py-2.5 font-body-sm text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    receipt_long
                  </span>
                  Rezervasyonlarım
                </Link>

                <Link
                  href="/vehicles"
                  className="flex items-center gap-2 px-4 py-2.5 font-body-sm text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    directions_car
                  </span>
                  Tüm Araç Filosu
                </Link>

                <div className="border-t border-surface-container my-1"></div>

                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-4 py-2 font-body-sm text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-lg">
                      logout
                    </span>
                    Çıkış Yap
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 font-label-md text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 font-label-md text-sm bg-primary-container text-on-primary hover:bg-secondary-container rounded-lg shadow-sm transition-all font-semibold"
              >
                Kayıt Ol
              </Link>
            </div>
          )}

          {/* Mobile Drawer Menu (<details> zero-JS responsive toggle) */}
          <details className="md:hidden group">
            <summary
              aria-label="Menüyü Aç"
              className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer select-none"
            >
              <span className="inline-flex items-center justify-center group-open:!hidden">
                <span className="material-symbols-outlined text-2xl leading-none">
                  menu
                </span>
              </span>
              <span className="!hidden group-open:!inline-flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl leading-none">
                  close
                </span>
              </span>
            </summary>

            <div className="fixed left-0 right-0 top-20 border-t border-surface-container bg-surface-container-lowest px-4 py-4 space-y-4 shadow-xl z-50">
              {/* Mobile Search Input */}
              <div>
                <NavbarSearchForm />
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth Actions */}
              <div className="pt-2 border-t border-surface-container">
                {session?.user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 py-1">
                      <Image
                        src={session.user.image || DEFAULT_AVATAR}
                        alt={session.user.name || "Kullanıcı"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-container/30"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-title-md text-sm font-bold text-on-surface truncate">
                          {session.user.name}
                        </span>
                        <span className="font-body-sm text-xs text-outline truncate">
                          {session.user.email}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/bookings"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-on-surface border border-outline-variant/40 hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        receipt_long
                      </span>
                      Rezervasyonlarım
                    </Link>

                    <form action={handleSignOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">
                          logout
                        </span>
                        Çıkış Yap
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      href="/login"
                      className="flex items-center justify-center py-2.5 px-3 rounded-lg border border-outline-variant/40 text-on-surface text-sm font-bold hover:bg-surface-container-low transition-colors"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center py-2.5 px-3 rounded-lg bg-primary-container text-on-primary text-sm font-bold hover:bg-secondary-container transition-all shadow-sm"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
