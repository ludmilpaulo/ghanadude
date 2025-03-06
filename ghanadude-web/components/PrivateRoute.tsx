"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../redux/store";
import React, { ComponentType } from "react";

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const Wrapper: React.FC<P> = (props) => {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);

    React.useEffect(() => {
      if (!user) {
        router.replace("/Login");
      }
    }, [user, router]);

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
