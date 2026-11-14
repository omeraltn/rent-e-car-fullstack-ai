import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Lütfen hem e-posta adresinizi hem de şifrenizi girin");
        }

        await connectDB();

        const email = String(credentials.email).toLowerCase().trim();
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          throw new Error("Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı");
        }

        if (!user.password) {
          throw new Error(
            "Bu hesap sosyal giriş yöntemi ile oluşturulmuştur. Lütfen Google ile giriş yapın."
          );
        }

        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Hatalı şifre");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || "",
          role: user.role || "user",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const email = user.email?.toLowerCase().trim();

          if (!email) return false;

          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            existingUser = await User.create({
              name: user.name || "Google User",
              email,
              image: user.image || "",
              role: "user",
              provider: "google",
            });
          }

          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          return true;
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = (token.role as "user" | "admin") || "user";
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-32-characters-long-123456",
});

