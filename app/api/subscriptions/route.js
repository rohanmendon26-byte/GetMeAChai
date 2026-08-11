import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";
import Subscription from "@/models/Subscription";

import { authOptions } from "@/lib/auth";

// =========================================================
// POST — Create subscription
// =========================================================

export async function POST(request) {
try {
const session = await getServerSession(authOptions);


if (!session?.user?.id) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Please login to support a creator.",
    },
    { status: 401 }
  );
}

const body = await request.json();
const { tierId } = body;

if (!tierId) {
  return NextResponse.json(
    {
      success: false,
      message: "Tier is required.",
    },
    { status: 400 }
  );
}

await connectDB();

const tier = await Tier.findById(tierId);

if (!tier || !tier.isActive) {
  return NextResponse.json(
    {
      success: false,
      message:
        "This tier is no longer available.",
    },
    { status: 404 }
  );
}

const creator = await User.findById(tier.creator);

if (!creator) {
  return NextResponse.json(
    {
      success: false,
      message: "Creator not found.",
    },
    { status: 404 }
  );
}

// Prevent creators from supporting themselves.
if (
  creator._id.toString() ===
  session.user.id.toString()
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You cannot support yourself.",
    },
    { status: 400 }
  );
}

// Check whether the supporter already
// supports this creator.
const existingSubscription =
  await Subscription.findOne({
    supporter: session.user.id,
    creator: creator._id,
    status: "active",
  });

if (existingSubscription) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You already support this creator. You can change your tier instead.",
    },
    { status: 409 }
  );
}

const subscription =
  await Subscription.create({
    supporter: session.user.id,
    creator: creator._id,
    tier: tier._id,
    amount: tier.price,
    status: "active",
    startedAt: new Date(),
  });

return NextResponse.json(
  {
    success: true,
    message:
      "You are now supporting this creator.",
    subscription: {
      id: subscription._id.toString(),
      creator: creator.username,
      tier: tier.name,
      amount: tier.price,
      status: subscription.status,
    },
  },
  { status: 201 }
);


} catch (error) {
console.error(
"Create subscription error:",
error
);


return NextResponse.json(
  {
    success: false,
    message:
      "Something went wrong while creating the subscription.",
  },
  { status: 500 }
);


}
}

// =========================================================
// PATCH — Change subscription tier
// =========================================================

export async function PATCH(request) {
try {
const session = await getServerSession(authOptions);

if (!session?.user?.id) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Please login to change your tier.",
    },
    { status: 401 }
  );
}

const body = await request.json();
const { tierId } = body;

if (!tierId) {
  return NextResponse.json(
    {
      success: false,
      message: "Tier is required.",
    },
    { status: 400 }
  );
}

await connectDB();

// Find the new tier.
const newTier = await Tier.findById(tierId);

if (!newTier || !newTier.isActive) {
  return NextResponse.json(
    {
      success: false,
      message:
        "This tier is no longer available.",
    },
    { status: 404 }
  );
}

// Find the creator who owns the new tier.
const creator = await User.findById(
  newTier.creator
);

if (!creator) {
  return NextResponse.json(
    {
      success: false,
      message: "Creator not found.",
    },
    { status: 404 }
  );
}

// Prevent creators from supporting themselves.
if (
  creator._id.toString() ===
  session.user.id.toString()
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You cannot support yourself.",
    },
    { status: 400 }
  );
}

// Find existing subscription.
const subscription =
  await Subscription.findOne({
    supporter: session.user.id,
    creator: creator._id,
    status: "active",
  });

if (!subscription) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You do not have an active subscription to this creator.",
    },
    { status: 404 }
  );
}

// Already subscribed to this tier.
if (
  subscription.tier.toString() ===
  newTier._id.toString()
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You are already subscribed to this tier.",
    },
    { status: 409 }
  );
}

// Update subscription.
subscription.tier = newTier._id;
subscription.amount = newTier.price;

await subscription.save();

return NextResponse.json({
  success: true,
  message:
    `Your tier has been changed to ${newTier.name}.`,
  subscription: {
    id: subscription._id.toString(),
    creator: creator.username,
    tier: newTier.name,
    amount: newTier.price,
    status: subscription.status,
  },
});


} catch (error) {
console.error(
"Change subscription tier error:",
error
);


return NextResponse.json(
  {
    success: false,
    message:
      "Something went wrong while changing your tier.",
  },
  { status: 500 }
);


}
}
