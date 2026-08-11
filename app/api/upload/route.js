import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import cloudinary from "@/lib/cloudinary";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // 2. Only creators can upload creator images
    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Creator access only.",
        },
        { status: 403 }
      );
    }

    // 3. Read uploaded file
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        { status: 400 }
      );
    }

    // 5. Validate file size
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    // 6. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 7. Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "getmeachai/avatars",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // 8. Return uploaded image URL
    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}