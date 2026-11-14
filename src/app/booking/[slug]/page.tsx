import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getVehicleBySlug } from "@/lib/vehicles";
import { BookingCheckoutForm } from "@/components/booking/BookingCheckoutForm";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

interface BookingPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return {
      title: "Rezervasyon - Rent-e-Car",
    };
  }

  return {
    title: `${vehicle.name} Rezervasyon & Kiralama - Rent-e-Car`,
    description: `${vehicle.name} için anında güvenli araç kiralama rezervasyonu oluşturun.`,
  };
}

export default async function BookingCheckoutPage({ params, searchParams }: BookingPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const initialPickupDate = typeof query.pickupDate === "string" ? query.pickupDate : undefined;
  const initialDropoffDate = typeof query.dropoffDate === "string" ? query.dropoffDate : undefined;
  const initialPickupLocation =
    typeof query.pickupLocation === "string" ? query.pickupLocation : undefined;
  const canceled = query.canceled === "true";

  // Strict Authentication Gate: Block unauthenticated access & preserve booking selections
  const session = await auth();
  if (!session?.user?.id) {
    const callbackParams = new URLSearchParams();
    if (initialPickupLocation) callbackParams.set("pickupLocation", initialPickupLocation);
    if (initialPickupDate) callbackParams.set("pickupDate", initialPickupDate);
    if (initialDropoffDate) callbackParams.set("dropoffDate", initialDropoffDate);

    const qs = callbackParams.toString();
    const callbackUrl = qs ? `/booking/${slug}?${qs}` : `/booking/${slug}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  await connectDB();
  const [vehicle, dbUser] = await Promise.all([
    getVehicleBySlug(slug),
    User.findById(session.user.id).lean(),
  ]);

  if (!vehicle) {
    notFound();
  }

  const renterName = dbUser?.name || session.user.name || "Değerli Üyemiz";
  const renterEmail = dbUser?.email || session.user.email || "";

  return (
    <div className="w-full bg-surface pb-space-xl min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-7xl mx-auto px-margin-mobile sm:px-margin md:px-gutter-lg py-space-md sm:py-space-lg flex flex-col gap-space-lg">
        {/* Top Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant/20 shadow-xs text-xs sm:text-sm text-on-surface-variant"
        >
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-base">home</span>
            Ana Sayfa
          </Link>
          <span className="text-outline-variant select-none">/</span>
          <Link href="/vehicles" className="hover:text-primary transition-colors">
            Araç Filosu
          </Link>
          <span className="text-outline-variant select-none">/</span>
          <Link
            href={`/vehicles/${vehicle.slug}`}
            className="hover:text-primary transition-colors font-medium"
          >
            {vehicle.name}
          </Link>
          <span className="text-outline-variant select-none">/</span>
          <span className="text-primary font-bold">Rezervasyon Tamamlama</span>
        </nav>

        {/* Interactive Streamlined Booking Checkout Component */}
        <BookingCheckoutForm
          vehicle={vehicle}
          initialPickupDate={initialPickupDate}
          initialDropoffDate={initialDropoffDate}
          initialPickupLocation={initialPickupLocation}
          renterName={renterName}
          renterEmail={renterEmail}
          canceled={canceled}
        />
      </div>
    </div>
  );
}
