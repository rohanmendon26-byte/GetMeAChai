"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChaiLoader from "@/components/ChaiLoader";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Loader2,
  Coffee,
  User,
  Image as ImageIcon,
  Globe,
  Github,
  Linkedin,
  Instagram,
  Upload,
} from "lucide-react";

export default function CreatorProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    image: "",
    coverImage: "",
    github: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    website: "",
    role: "supporter",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/creator/profile");
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }

          throw new Error(
            data.message || "Failed to load profile."
          );
        }

        const user = data.user;

        if (isMounted) {
          setForm({
            name: user.name || "",
            username: user.username || "",
            bio: user.bio || "",
            image: user.image || "",
            coverImage: user.coverImage || "",
            github: user.socialLinks?.github || "",
            instagram: user.socialLinks?.instagram || "",
            twitter: user.socialLinks?.twitter || "",
            linkedin: user.socialLinks?.linkedin || "",
            website: user.socialLinks?.website || "",
            role: user.role || "supporter",
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleImageUpload(event, type) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (type === "image") {
      setUploadingImage(true);
    } else {
      setUploadingCover(true);
    }

    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload image."
        );
      }

      setForm((previous) => ({
        ...previous,
        [type]: data.url,
      }));

      const uploadMsg =
        type === "image"
          ? "Profile image uploaded. Click Save Changes to apply it."
          : "Cover image uploaded. Click Save Changes to apply it.";

      setMessage(uploadMsg);
      toast.success(uploadMsg);
    } catch (error) {
      console.error(error);
      setError(error.message);
      toast.error(error.message || "Failed to upload image.");
    } finally {
      if (type === "image") {
        setUploadingImage(false);
      } else {
        setUploadingCover(false);
      }

      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/creator/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            username: form.username,
            bio: form.bio,
            image: form.image,
            coverImage: form.coverImage,
            socialLinks: {
              github: form.github,
              instagram: form.instagram,
              twitter: form.twitter,
              linkedin: form.linkedin,
              website: form.website,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile."
        );
      }

      setMessage(
        "Profile updated successfully!"
      );
      toast.success("Profile updated successfully!");

      router.refresh();
    } catch (error) {
      console.error(error);
      setError(error.message);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ChaiLoader message="Loading profile settings..." />;
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href={form.role === "creator" ? "/creator/dashboard" : "/dashboard"}
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 font-bold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-black">
              <Coffee size={16} />
            </div>

            <span className="font-bold">
              GetMeAChai
            </span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-amber-400">
            {form.role === "creator" ? "Creator Settings" : "Supporter Profile Settings"}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Edit your profile
          </h1>

          <p className="mt-3 text-gray-500">
            {form.role === "creator"
              ? "Update the information supporters see on your public creator profile."
              : "Customize your public profile, bio, avatar, and social links."}
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
        >
          {/* Basic Information */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <User size={19} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Basic Information
                </h2>

                <p className="text-sm text-gray-500">
                  Tell supporters who you are.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Input
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />

              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="yourusername"
                required
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Bio
              </label>

              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength={500}
                rows={5}
                placeholder="Tell your supporters about yourself..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
              />

              <p className="mt-2 text-right text-xs text-gray-600">
                {form.bio.length}/500
              </p>
            </div>

            {/* Account Mode */}
            <div className="mt-6 border-t border-white/5 pt-6">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Account Type
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Switch between receiving contributions as a Creator or supporting creators as a Community Supporter.
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, role: "creator" }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    form.role === "creator"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20"
                  }`}
                >
                  ☕ Creator Mode
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, role: "supporter" }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    form.role === "supporter"
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20"
                  }`}
                >
                  🤝 Supporter Mode
                </button>
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <ImageIcon size={19} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Images
                </h2>

                <p className="text-sm text-gray-500">
                  Add your profile and cover images.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-8">
              {/* Profile Image */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Profile Image
                </label>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/40 text-amber-400">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={32} />
                    )}
                  </div>

                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400">
                      {uploadingImage ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={17} />
                          Upload Profile Image
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleImageUpload(
                            event,
                            "image"
                          )
                        }
                        disabled={uploadingImage}
                      />
                    </label>

                    <p className="mt-2 text-xs text-gray-600">
                      JPG, PNG, WEBP. Maximum 5 MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Cover Image
                </label>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <div className="h-40 w-full">
                    {form.coverImage ? (
                      <img
                        src={form.coverImage}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-600">
                        <ImageIcon size={35} />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 p-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-amber-500/30 hover:text-amber-400">
                      {uploadingCover ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={17} />
                          Upload Cover Image
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleImageUpload(
                            event,
                            "coverImage"
                          )
                        }
                        disabled={uploadingCover}
                      />
                    </label>

                    <p className="mt-2 text-xs text-gray-600">
                      JPG, PNG, WEBP. Maximum 5 MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Optional URL fields */}
              <div className="grid gap-5 border-t border-white/10 pt-6">
                <Input
                  label="Profile Image URL (optional)"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="Uploaded image URL"
                />

                <Input
                  label="Cover Image URL (optional)"
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  placeholder="Uploaded cover image URL"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Globe size={19} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Social Links
                </h2>

                <p className="text-sm text-gray-500">
                  Let supporters find you elsewhere.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Input
                label="GitHub"
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />

              <Input
                label="Instagram"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
              />

              <Input
                label="Twitter / X"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                placeholder="https://x.com/username"
              />

              <Input
                label="LinkedIn"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/${form.username}`}
              target="_blank"
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Preview Profile
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                uploadingImage ||
                uploadingCover
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
      />
    </div>
  );
}