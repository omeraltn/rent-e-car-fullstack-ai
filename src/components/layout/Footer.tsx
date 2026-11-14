import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container mt-auto">
      <div className="w-full px-margin-mobile sm:px-margin md:px-gutter lg:px-margin-desktop py-space-xl">
        {/* Top: Brand info and Link columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-xl pb-space-xl border-b border-surface-container">
          {/* Brand Vision (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-space-sm max-w-sm">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-extrabold text-primary-container tracking-wider">
                MORENT
              </span>
            </Link>
            <p className="font-body-md text-body-md text-outline leading-relaxed mt-1">
              Vizyonumuz; araç kiralama deneyimini en yüksek güvenlik standartları, şeffaf fiyatlandırma ve birinci sınıf konforla buluşturmaktır.
            </p>
          </div>

          {/* Links (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-space-lg">
            {/* Column 1: Hakkımızda */}
            <div className="flex flex-col gap-space-md">
              <h4 className="font-title-md text-title-md font-bold text-on-surface">
                Hakkımızda
              </h4>
              <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-outline">
                <li>
                  <Link href="/vehicles" className="hover:text-primary transition-colors">
                    Nasıl Çalışır?
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles?featured=true" className="hover:text-primary transition-colors">
                    Öne Çıkan Araçlar
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles" className="hover:text-primary transition-colors">
                    İş Birliklerimiz
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles" className="hover:text-primary transition-colors">
                    Kurumsal Kiralama
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Topluluk */}
            <div className="flex flex-col gap-space-md">
              <h4 className="font-title-md text-title-md font-bold text-on-surface">
                Topluluk
              </h4>
              <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-outline">
                <li>
                  <Link href="/vehicles" className="hover:text-primary transition-colors">
                    Etkinlikler
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles" className="hover:text-primary transition-colors">
                    Blog & Rehberler
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles" className="hover:text-primary transition-colors">
                    Podcast
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles" className="hover:text-primary transition-colors">
                    Arkadaşını Davet Et
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Sosyal Medya */}
            <div className="flex flex-col gap-space-md col-span-2 sm:col-span-1">
              <h4 className="font-title-md text-title-md font-bold text-on-surface">
                Sosyal Medya
              </h4>
              <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-outline">
                <li>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Twitter (X)
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-space-lg flex flex-col-reverse sm:flex-row items-center justify-between gap-space-md font-label-md text-label-md text-on-surface font-semibold">
          <p>© 2025 MORENT. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-space-xl">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

