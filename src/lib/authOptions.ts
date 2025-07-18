import { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // ... เช็ค user จาก DB ตามปกติ
        return { id: "user1", name: "User", email: credentials?.email };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy, // ✅ แก้ตรงนี้
  },
  secret: process.env.NEXTAUTH_SECRET,
};
