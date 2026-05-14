import { useState } from "react";

import { DEMO_PASSWORD } from "../constants/credentials";
import type { RoleCredential } from "../types";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillCredential = (credential: RoleCredential) => {
    setEmail(credential.email);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    setLoading,
    error,
    setError,
    fillCredential,
  };
};
