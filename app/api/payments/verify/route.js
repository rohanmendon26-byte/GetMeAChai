import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";

import { authOptions } from "@/lib/auth";

export async function POST(request) {
    try {
        // ============================================
        // AUTHENTICATION
        // ============================================

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please login to complete payment.",
                },
                { status: 401 }
            );
        }

        // ============================================
        // GET PAYMENT DATA
        // ============================================

        const body = await request.json();

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            tierId,
        } = body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !tierId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment information is incomplete.",
                },
                { status: 400 }
            );
        }

        // ============================================
        // VERIFY RAZORPAY SIGNATURE
        // ============================================

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment verification failed.",
                },
                { status: 400 }
            );
        }

        // ============================================
        // DATABASE
        // ============================================

        await connectDB();

        // ============================================
        // FIND TIER
        // ============================================

        const tier = await Tier.findById(tierId);

        if (!tier || !tier.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This tier is no longer available.",
                },
                { status: 404 }
            );
        }

        // ============================================
        // FIND CREATOR
        // ============================================

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

        // ============================================
        // PREVENT SELF-SUPPORT
        // ============================================

        if (
            creator._id.toString() ===
            session.user.id.toString()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot support yourself.",
                },
                { status: 400 }
            );
        }

        // ============================================
        // CHECK EXISTING SUBSCRIPTION
        // ============================================

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
                        "You already support this creator.",
                },
                { status: 409 }
            );
        }

        // ============================================
        // CREATE SUBSCRIPTION
        // ============================================

        const subscription = await Subscription.create({
            supporter: session.user.id,
            creator: creator._id,
            tier: tier._id,
            amount: tier.price,
            status: "active",
            startedAt: new Date(),
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            paymentStatus: "paid",
        });

        // ============================================
        // CREATE PAYMENT RECORD
        // ============================================

        await Payment.create({
            userId: session.user.id,
            creatorId: creator._id,
            tierId: tier._id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: tier.price,
            currency: "INR",
            paymentType: "tier_subscription",
            status: "paid",
        }).catch((err) => console.error("Payment log error:", err));

        // ============================================
        // SEND NOTIFICATION TO CREATOR
        // ============================================

        await Notification.create({
            recipient: creator._id,
            sender: session.user.id,
            type: "new_supporter",
            title: "New Supporter Joined! 🎉",
            message: `${session.user.name || "A supporter"} joined your ${tier.name} tier for ₹${tier.price}/mo.`,
            link: "/creator/dashboard",
        }).catch((err) => console.error("Notification dispatch error:", err));

        return NextResponse.json({
            success: true,
            message:
                `Payment successful! You are now supporting ${creator.name}.`,
            subscription: {
                id: subscription._id.toString(),
                creator: creator.username,
                tier: tier.name,
                amount: tier.price,
                status: subscription.status,
            },
        });
    } catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Something went wrong while verifying your payment.",
            },
            { status: 500 }
        );
    }
}