import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId:
        process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID || "",
      clientSecret:
        process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        await connectDB();

        const email = credentials.email.trim().toLowerCase();

        const user = await User.findOne({
          email,
        }).select("+passwordHash");

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatch) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image || "",
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectDB();
          let email = (
            user?.email ||
            profile?.email ||
            (account?.provider === "github" && profile?.id
              ? `${profile.id}+${profile.login || "user"}@users.noreply.github.com`
              : "")
          )
            ?.trim()
            ?.toLowerCase();

          if (!email) return false;

          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            let baseUsername = (
              profile?.login ||
              profile?.given_name ||
              user?.name ||
              email.split("@")[0] ||
              "user"
            )
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .slice(0, 15);

            if (baseUsername.length < 3) {
              baseUsername = `user${Math.floor(1000 + Math.random() * 9000)}`;
            }

            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
              username = `${baseUsername}${counter++}`;
            }

            existingUser = await User.create({
              name: user?.name || profile?.name || profile?.login || "Supporter",
              username,
              email,
              image:
                user?.image ||
                profile?.avatar_url ||
                profile?.picture ||
                "",
              role: "supporter",
            });
          } else if (
            !existingUser.image &&
            (user?.image || profile?.avatar_url || profile?.picture)
          ) {
            existingUser.image =
              user?.image || profile?.avatar_url || profile?.picture;
            await existingUser.save();
          }

          user.id = existingUser._id.toString();
          user.username = existingUser.username;
          user.role = existingUser.role;
          user.name = existingUser.name;
          user.image = existingUser.image || "";
          return true;
        } catch (error) {
          console.error("OAuth signIn error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session: updatedSession }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.picture = user.image;
      }

      if (trigger === "update" && updatedSession) {
        if (updatedSession.name) token.name = updatedSession.name;
        if (updatedSession.username) token.username = updatedSession.username;
        if (updatedSession.role) token.role = updatedSession.role;
        if (updatedSession.image) token.picture = updatedSession.image;
      }

      if ((!token.username || !token.role) && (token.id || token.email)) {
        try {
          await connectDB();
          const query = token.id
            ? { _id: token.id }
            : { email: token.email?.toLowerCase() };
          const dbUser = await User.findOne(query)
            .select("username role name image")
            .lean();

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.username = dbUser.username;
            token.role = dbUser.role;
            if (dbUser.name) token.name = dbUser.name;
            if (dbUser.image) token.picture = dbUser.image;
          }
        } catch (e) {
          console.error("JWT fetch user error:", e);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        if (token.picture) session.user.image = token.picture;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};