import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import Tier from "@/models/Tier";

import { authOptions } from "@/lib/auth";

export async function GET(request) {
try {
const session =
await getServerSession(authOptions);


if (!session?.user?.id) {
  return NextResponse.json(
    {
      success: false,
      message: "Please login first.",
    },
    { status: 401 }
  );
}

const { searchParams } =
  new URL(request.url);

const creatorId =
  searchParams.get("creatorId");

if (!creatorId) {
  return NextResponse.json(
    {
      success: false,
      message: "Creator ID is required.",
    },
    { status: 400 }
  );
}

await connectDB();

/*
 * Make sure the supporter actually has
 * an active subscription with this creator.
 *
 * This prevents a supporter from using
 * this endpoint to inspect arbitrary
 * creators' supporter tiers.
 */
const subscription =
  await Subscription.findOne({
    supporter: session.user.id,
    creator: creatorId,
    status: "active",
  });

if (!subscription) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You are not supporting this creator.",
    },
    { status: 403 }
  );
}

const tiers = await Tier.find({
  creator: creatorId,
  isActive: true,
})
  .sort({
    order: 1,
    createdAt: 1,
  })
  .select(
    "name price description benefits image order"
  )
  .lean();

return NextResponse.json({
  success: true,
  tiers,
});


} catch (error) {
console.error(
"Get supporter creator tiers error:",
error
);


return NextResponse.json(
  {
    success: false,
    message:
      "Failed to load creator tiers.",
  },
  { status: 500 }
);


}
}
