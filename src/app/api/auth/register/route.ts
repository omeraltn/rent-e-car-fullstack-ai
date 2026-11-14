import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Zaten aktif bir oturumunuz bulunuyor." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "İsim en az 2 karakter olmalıdır" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Geçerli bir e-posta adresi gereklidir" },
        { status: 400 }
      );
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const cleanEmail = email.toLowerCase().trim();

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Lütfen geçerli bir e-posta formatı girin" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre en az 6 karakter olmalıdır",
        },
        { status: 400 }
      );
    }

    // 2. Database Connection
    await connectDB();

    // 3. Existing User Check
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut",
        },
        { status: 409 }
      );
    }

    // 4. Hash Password & Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
      provider: "credentials",
      image: "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hesap başarıyla oluşturuldu",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kayıt işlemi sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}

