"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../redux/store";
import React from "react";

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const Wrapper = (props: any) => {
    const router = useRouter();

    // Get user from redux state
    const user = useSelector((state: RootState) => state.auth.user);

    React.useEffect(() => {
      if (!user) {
        router.replace("/Login");
      }
    }, [user, router]);

    // component renders only when user is available
    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;