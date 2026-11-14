import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local first, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { User } from "../src/models/User";
import { Vehicle } from "../src/models/Vehicle";
import { Booking } from "../src/models/Booking";
import { SEED_VEHICLES } from "../src/lib/seed-data";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/rent-e-car";

async function seedDatabase() {
  console.log("🚀 Rent-e-Car veritabanı tohumlama (seed) işlemi başlatılıyor...");
  console.log(`MongoDB bağlantı adresi: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB bağlantısı başarıyla kuruldu.");

    // Clean existing seed collections
    console.log("🧹 Mevcut Kullanıcı, Araç ve Rezervasyon kayıtları temizleniyor...");
    await Booking.deleteMany({});
    await Vehicle.deleteMany({});
    await User.deleteMany({});
    console.log("✅ Eski veriler temizlendi.");

    // 1. Seed Users
    console.log("👤 Varsayılan kullanıcılar oluşturuluyor...");
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

    console.log(
      `✅ 2 varsayılan kullanıcı oluşturuldu:\n   - Yönetici: admin@rent-e-car.com (Şifre: AdminPass123!)\n   - Müşteri: emre.yilmaz@example.com (Şifre: UserPass123!)`
    );

    // 2. Seed Vehicles with Turkish values (category, transmission, fuelType, etc.)
    console.log("🚗 Türkçe özelliklere ve Türkiye lokasyonlarına sahip araç filosu oluşturuluyor...");
    const createdVehicles = await Vehicle.insertMany(SEED_VEHICLES);
    console.log(`✅ Toplam ${createdVehicles.length} araç başarıyla kaydedildi.`);

    // 3. Seed Sample Booking for Verification
    console.log("📝 Doğrulama için örnek rezervasyon kaydı oluşturuluyor...");
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

    await Booking.create({
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
      // Stripe placeholder
      paymentStatus: "odendi",
      stripeSessionId: "cs_test_sample_placeholder_12345",
    });

    console.log("✅ 1 adet örnek onaylı rezervasyon kaydı oluşturuldu.");
    console.log("🎉 Veritabanı tohumlama işlemi başarıyla tamamlandı!");
  } catch (error) {
    console.error("❌ Veritabanı tohumlama hatası:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB bağlantısı kapatıldı.");
    process.exit(0);
  }
}

seedDatabase();
