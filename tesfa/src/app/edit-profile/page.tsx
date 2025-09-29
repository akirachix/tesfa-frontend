"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useFetchOrganization from "../hooks/useFetchOrganization";
import { updateUser } from "../utils/fetchOrganizations";
import { CameraIcon, Eye, EyeOff } from "lucide-react";
import Layout from "../sharedComponents/Layout";

export default function EditProfilePage() {
  const router = useRouter();
  const { user: profile, refetch, loading, error } = useFetchOrganization();
  const [showPassword, setShowPassword] = useState(false);
  const [logoImage, setLogoImage] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    org_name: "NGO",
    logo_image: null as File | null,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"" | "error">("");
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || "",
        password: "",
        org_name: profile.org_name || "NGO",
        logo_image: null,
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      setLogoImage(files[0]);
      setFormData((prev) => ({ ...prev, logo_image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  type DataToSend = FormData | {
    email: string;
    org_name: string;
    role: string;
    password?: string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const email = formData.email.trim();
    const org_name = (formData.org_name || "NGO").trim();

    let dataToSend: DataToSend;
    if (logoImage) {
      dataToSend = new FormData();
      dataToSend.append("email", email);
      dataToSend.append("org_name", org_name);
      dataToSend.append("role", "organization");
      if (formData.password) dataToSend.append("password", formData.password);
      dataToSend.append("logo_image", logoImage);
    } else {
      dataToSend = {
        email,
        org_name,
        role: "organization",
      };
      if (formData.password) dataToSend.password = formData.password;
    }

    try {
      await updateUser(dataToSend);
      setShowSuccess(true);
      setUpdateStatus("");
      setUpdateMessage("");
      refetch().finally(() => setSubmitting(false));
      router.push("/profile");
    } catch (err: unknown) {
      setSubmitting(false);
      if (err instanceof Error) {
        setUpdateMessage(err.message);
      } else {
        setUpdateMessage("Update failed");
      }
      setUpdateStatus("error");
      setTimeout(() => {
        setUpdateStatus("");
        setUpdateMessage("");
      }, 2000);
    }
  };

  if (loading && !submitting)
    return (
      <div className="lex justify-center items-center text-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center ml-175 text-center text-red-500">
        {error}
      </div>
    );
  if (!profile) return null;

  return (
    <Layout>
      <main className="w-full flex flex-col items-center min-h-screen bg-[#FCF6F7] overflow-x-hidden">
        <div className="w-full px-12 m-10">
          <h1 className="text-5xl font-medium text-[#00353D] mb-2">Edit Profile</h1>
          <div className="w-full h-[6px] bg-[#8BB2B5] rounded" />
        </div>
        <div className="flex flex-col items-center mt-16 w-full">
          <div
            className="relative mb-3 flex flex-col items-center w-full"
            style={{ minHeight: 230 }}
          >
            <div className="w-[200px] h-[200px] rounded-full border-4 border-[#C3A041] flex items-center justify-center overflow-hidden bg-white mx-auto">
              {logoImage ? (
                <Image
                  src={URL.createObjectURL(logoImage)}
                  alt="Preview"
                  className="object-contain"
                  width={180}
                  height={180}
                  style={{ width: "180px", height: "180px" }}
                />
              ) : profile.logo_image ? (
                <Image
                  src={
                    profile.logo_image.startsWith("http")
                      ? profile.logo_image
                      : `/${profile.logo_image.replace(/^\/+/, "")}`
                  }
                  alt="Current Logo"
                  className="object-contain"
                  width={180}
                  height={180}
                  style={{ width: "180px", height: "180px" }}
                />
              ) : (
                <Image
                  src="/Images/image 4.png"
                  alt="Default Logo"
                  className="object-contain"
                  width={160}
                  height={160}
                  style={{ width: "160px", height: "160px" }}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("logoInput")?.click()}
              className="absolute bottom-13 right-184 bg-white border-2 border-[#C3A041] text-[#C3A041] w-9 h-9 rounded-full flex items-center justify-center shadow hover:bg-[#f3fbfd] transition"
              aria-label="Upload logo"
            >
              <CameraIcon className="w-5 h-5 cursor-pointer" />
            </button>
            <input
              id="logoInput"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            {formData.org_name && (
              <div className="mt-3 font-bold text-3xl text-[#C3A041] ">
                {formData.org_name}
              </div>
            )}
            {showSuccess && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[220px] w-full flex justify-center z-10 pointer-events-none">
                <div className="bg-white border border-green-600 text-green-700 px-10 py-4 rounded-xl shadow-lg text-xl font-bold animate-fade-in pointer-events-auto">
                  Successfully updated!
                </div>
              </div>
            )}
            {updateStatus === "error" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[280px] w-full flex justify-center z-10 pointer-events-none">
                <div className="bg-white text-red-700 px-10 py-4 rounded-xl text-xl font-semibold animate-fade-in pointer-events-auto">
                  {updateMessage}
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-[#F3FBFD] rounded-2xl shadow-[12px_12px_32px_rgba(0,0,0,0.15)] px-7 py-8 flex flex-col gap-7"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xl text-[#00353D] font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 px-5 py-2 border-2 border-[#C3A041] rounded-full outline-none focus:ring-2 focus:ring-[#C3A041] text-lg placeholder-[#C3A041] font-medium bg-transparent"
                placeholder="email"
                maxLength={254}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xl text-[#00353D] font-medium">
                Change Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="password"
                  autoComplete="new-password"
                  className="mt-1 px-5 py-2 border-2 border-[#C3A041] rounded-full outline-none focus:ring-2 focus:ring-[#C3A041] text-lg placeholder-[#C3A041] font-medium bg-transparent w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#C3A041] hover:text-[#00353D] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-46 justify-center mt-2">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="px-5 py-1 border-2 border-[#03363D] text-[#03363D] rounded-full text-lg font-medium shadow hover:bg-[#f3fbfd] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-1 bg-[#03363D] text-white rounded-full text-lg font-medium shadow hover:bg-[#065a60] transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
}
