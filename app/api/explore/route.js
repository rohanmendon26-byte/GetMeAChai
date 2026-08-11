import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";
import Subscription from "@/models/Subscription";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const filter = {
      role: "creator",
    };

    if (query.trim()) {
      const regex = new RegExp(query.trim(), "i");
      filter.$or = [
        { name: regex },
        { username: regex },
        { bio: regex },
      ];
    }

    const creators = await User.find(filter)
      .select("name username bio image coverImage socialLinks createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich creators with tier count, starting price, and active supporter count
    const enrichedCreators = await Promise.all(
      creators.map(async (creator) => {
        const [tiers, activeSupporters] = await Promise.all([
          Tier.find({ creator: creator._id, isActive: true }).select("price").lean(),
          Subscription.countDocuments({ creator: creator._id, status: "active" }),
        ]);

        const minPrice =
          tiers.length > 0
            ? Math.min(...tiers.map((t) => t.price || 0))
            : 0;

        return {
          id: creator._id.toString(),
          name: creator.name,
          username: creator.username,
          bio: creator.bio || "",
          image: creator.image || "",
          coverImage: creator.coverImage || "",
          socialLinks: creator.socialLinks || {},
          tierCount: tiers.length,
          minPrice,
          supportersCount: activeSupporters,
          createdAt: creator.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      creators: enrichedCreators,
    });
  } catch (error) {
    console.error("Explore API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to explore creators.",
      },
      { status: 500 }
    );
  }
}
