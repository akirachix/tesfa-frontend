"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding/welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#fdf6f6] text-center px-4 py-8">

      <Image
        src="/Images/Group66.png" 
        alt="Logo"
        width={400}
        height={200}
        className="mb-26 w-48 md:w-100 h-auto object-contain"
      />
     
      <p className="text-xl md:text-5xl font-medium text-[#00353D] leading-relaxed italic">
        The essence of{" "}
        <span className="font-semibold text-[#CDA12B]">hope</span> and{" "}
        <span className="font-semibold text-[#CDA12B]">renewal</span> after
        hardship
      </p>
     
      <div className="mt-8 w-100 mx-auto">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#CDA12B] to-transparent mb-10"></div>
      </div>
    </div>
  );
}






