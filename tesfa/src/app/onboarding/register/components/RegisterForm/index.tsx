'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import useRegister from "@/app/hooks/useRegister";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function RegisterForm({
  searchParams,
}: {
  searchParams: Promise<{ agreed?: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(searchParams); 
  const { register, loading, error } = useRegister();

  const [formData, setFormData] = useState({
    organization: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordLengthError, setPasswordLengthError] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [organizationError, setOrganizationError] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const agreed = resolvedParams.agreed;
    if (agreed === "true") {
      setTermsAccepted(true);
    }
  }, [resolvedParams]);

  const validateOrganization = (orgName: string) => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/;
    return regex.test(orgName);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "organization") {
        setOrganizationError(value !== "" && !validateOrganization(value));
      }

      if (name === "password") {
        const isTooShort = value !== "" && value.length < 8;
        setPasswordLengthError(isTooShort);
        if (updated.confirmPassword) {
          const isMatch = value === updated.confirmPassword;
          setPasswordMatchError(!isMatch);
        }
      }

      if (name === "confirmPassword") {
        const isMatch = updated.password === value;
        setPasswordMatchError(value !== "" && !isMatch);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { organization, email, password, confirmPassword } = formData;

    let hasError = false;

    if (!validateOrganization(organization)) {
      setOrganizationError(true);
      hasError = true;
    } else {
      setOrganizationError(false);
    }

    if (password.length < 8) {
      setPasswordLengthError(true);
      hasError = true;
    } else {
      setPasswordLengthError(false);
    }

    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      hasError = true;
    } else {
      setPasswordMatchError(false);
    }

    if (!termsAccepted) {
      hasError = true;
    }

    if (hasError) return;

    const result = await register({
      org_name: organization,
      email,
      password,
      password2: confirmPassword,
      role: "organization",
    });

    if (result) {
      router.push("/onboarding/login");
    }
  };

  return (
    <div className="md:w-1/2 text-left max-w-md">
      <h2 className="text-xl md:text-5xl font-semibold text-[#CDA12B] mb-6 relative inline-block">
        Create Account
        <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-transparent via-[#CDA12B] to-transparent"></span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 mt-12 text-black">
        <div>
          <label
            htmlFor="organization"
            className="block text-2xl font-light text-[#00353D] mb-1"
          >
            Organization name
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            placeholder="Enter organization name"
            value={formData.organization}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl text-[#00353D] focus:ring-2 focus:ring-[#CDA12B] focus:border-transparent transition"
            required
          />
          {organizationError && (
            <p className="text-red-500 text-sm mt-1">
              Organization name can't contain only numbers.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-2xl font-light text-[#00353D] mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl text-[#00353D] focus:ring-2 focus:ring-[#CDA12B] focus:border-transparent transition"
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="password"
            className="block text-2xl font-light text-[#00353D] mb-1"
          >
            Password
          </label>
          <input
            type={showPassword.password ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl text-[#00353D] focus:ring-2 focus:ring-[#CDA12B] focus:border-transparent transition pr-12"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => ({ ...prev, password: !prev.password }))
            }
            className="absolute cursor-pointer right-3 top-12 text-[#00353D] text-xl"
            tabIndex={-1}
            aria-label={showPassword.password ? "Hide password" : "Show password"}
          >
            {showPassword.password ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>

        {passwordLengthError && (
          <p className="text-red-500 text-sm text-left mt-[-8px] mb-2">
            Password must be at least 8 characters.
          </p>
        )}

        <div className="relative">
          <label
            htmlFor="confirmPassword"
            className="block text-2xl font-light text-[#00353D] mb-1"
          >
            Confirm password
          </label>
          <input
            type={showPassword.confirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 text-[#00353D] rounded-xl focus:ring-2 focus:ring-[#CDA12B] focus:border-transparent transition pr-12"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))
            }
            className="absolute right-3 cursor-pointer top-12 text-[#00353D] text-xl"
            tabIndex={-1}
            aria-label={
              showPassword.confirmPassword ? "Hide confirm password" : "Show confirm password"
            }
          >
            {showPassword.confirmPassword ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>

        {passwordMatchError && (
          <p className="text-red-500 text-sm text-left mt-[-8px] mb-2">
            Passwords must match.
          </p>
        )}

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-5 w-5 text-[#CDA12B] cursor-pointer rounded focus:ring-[#CDA12B]"
            required
          />
          <label htmlFor="terms" className="ml-2 cursor-pointer  text-[#00353D] text-lg">
            I agree to the{" "}
            <Link href="/onboarding/terms" className="text-[#CDA12B] hover:underline">
              Terms and Conditions.
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00353D] text-white font-extrabold py-3 rounded-xl hover:bg-[#00695C] transition-colors duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1 mt-5 cursor-pointer"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <p className="text-[#00353D] text-center text-xl mt-4 font-extralight">
          Do you have an account?{" "}
          <Link href="/onboarding/login" className="text-[#CDA12B] font-extrabold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}