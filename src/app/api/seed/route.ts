import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Vehicle } from "@/models/Vehicle";
import { Booking } from "@/models/Booking";
import { SEED_VEHICLES } from "@/lib/seed-data";

/**
 * Endpoint to seed or reset the database:
 * GET /api/seed or POST /api/seed
 */
async function handleSeed() {
  try {
    await connectDB();

    // 1. Clear existing test data
    await Booking.deleteMany({});
    await Vehicle.deleteMany({});
    await User.deleteMany({});

    // 2. Seed Default Users
    const adminPassword = await bcrypt.hash("AdminPass123!", 10);
    const userPassword = await bcrypt.hash("UserPass123!", 10);

    const adminUser = await User.create({
      name: "Morent Yönetici",
      email: "admin@rent-e-car.com",
      password: adminPassword,
      role: "admin",
      provider: "credentials",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    });

    const standardUser = await User.create({
      name: "Emre Yılmaz",
      email: "emre.yilmaz@example.com",
      password: userPassword,
      role: "user",
      provider: "credentials",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    });

    // 3. Seed Vehicles
    const createdVehicles = await Vehicle.insertMany(SEED_VEHICLES);

    // 4. Seed Sample Booking
    const sampleVehicle = createdVehicles[1]; // Nissan GT-R Nismo
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 3);
    const dropoffDate = new Date();
    dropoffDate.setDate(dropoffDate.getDate() + 6);

    const totalDays = 3;
    const pricePerDay = sampleVehicle.pricePerDay;
    const subtotal = pricePerDay * totalDays;
    const taxAmount = +(subtotal * 0.1).toFixed(2);
    const totalPrice = subtotal + taxAmount;

    const sampleBooking = await Booking.create({
      user: standardUser._id,
      vehicle: sampleVehicle._id,
      pickupLocation: "İstanbul - Kadıköy",
      dropoffLocation: "İstanbul - Kadıköy",
      pickupDate,
      dropoffDate,
      pickupTime: "10:00",
      dropoffTime: "10:00",
      totalDays,
      pricePerDay,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalPrice,
      renterName: standardUser.name,
      renterEmail: standardUser.email,
      renterPhone: "+90 532 123 45 67",
      renterAddress: "Moda Caddesi No: 42/3, Kadıköy",
      renterCity: "İstanbul",
      bookingStatus: "onaylandi",
      paymentStatus: "odendi",
      stripeSessionId: "cs_test_sample_placeholder_12345",
    });

    return NextResponse.json({
      success: true,
      message: "Veritabanı başarıyla tohumlandı (Database seeded successfully)!",
      summary: {
        usersCount: 2,
        vehiclesCount: createdVehicles.length,
        bookingsCount: 1,
        users: [
          { email: adminUser.email, role: adminUser.role, pass: "AdminPass123!" },
          { email: standardUser.email, role: standardUser.role, pass: "UserPass123!" },
        ],
        sampleBookingId: sampleBooking._id.toString(),
      },
    });
  } catch (error) {
    console.error("Seed endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Veritabanı tohumlama işlemi sırasında hata oluştu",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

