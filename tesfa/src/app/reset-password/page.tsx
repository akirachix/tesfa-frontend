"use client";
import { useState } from "react";
import { usePasswordReset } from "../hooks/usePasswordReset";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { loading, message, error, requestReset } = usePasswordReset();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestReset(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0E545F] overflow-hidden">
      <div className="absolute top-10 left-10 w-15">
        <Image src="/Images/Tlogo.png" alt="Logo" width={60} height={60} />
      </div>
      <div className="bg-[#00353D] p-8 rounded-xl shadow-lg w-100 text-center relative">
        <div className="absolute -bottom-105 -right-165 w-100 h-100 rounded-full border-[10px] border-[#011d1f]  opacity-40"></div>
        <div className="absolute -bottom-130 -right-190 w-150 h-150 rounded-full border-[100px] border-[#05393a]  opacity-40"></div>
        <div className="absolute -bottom-130 -right-190 w-150 h-150 rounded-full border-[10px] border-[#011d1f]  opacity-40"></div>
       
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-10 text-bg-active-gradient cursor-pointer hover:text-[#]"
        >
          <FaArrowLeft />
        </button>
    
        <h2 className="text-[#d4af37] text-2xl font-semibold mb-6">
          Forgot Password?
        </h2>
      
        <form onSubmit={handleSubmit} className="space-y-7">
          <input
            type="email"
            placeholder="Enter your email here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-none
              bg-white text-gray-800 placeholder-gray-400
              focus:ring-2 focus:ring-[#d4af37] outline-none shadow-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-white py-2 rounded-xl cursor-pointer font-medium hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      
        {message && <p className="text-green-400 mt-4">{message}</p>}
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}
