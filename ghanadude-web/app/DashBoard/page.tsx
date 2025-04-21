"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getCurrentUser } from "@/services/authService";
import { logoutUser } from "@/redux/slices/authSlice";
import withAuth from "@/components/PrivateRoute";

const UserList = dynamic(() => import("./UserList"), { ssr: false });
const OrderList = dynamic(() => import("./OrderList"), { ssr: false });
const ProductList = dynamic(() => import("./ProductList"), { ssr: false });
const Revenue = dynamic(() => import("./Revenue"), { ssr: false });
const Emails = dynamic(() => import("./Emails"), { ssr: false });
const Management = dynamic(() => import("./Management"), { ssr: false });

const DashBoard: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth_user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const token = auth_user?.token;
    if (!token) {
      router.push("/Login");
      return;
    }

    getCurrentUser(token)
      .then((data) => {
        if (!data.is_staff) {
          alert("Only staff members are allowed on this page");
          dispatch(logoutUser());
          router.push("/Login");
        }
      })
      .catch(() => {
        dispatch(logoutUser());
        router.push("/Login");
      });
  }, [auth_user, router, dispatch]);

  const [activeComponent, setActiveComponent] = useState("orders");

  let componentToRender;
  switch (activeComponent) {
    case "users":
      componentToRender = <UserList />;
      break;
    case "orders":
      componentToRender = <OrderList />;
      break;
    case "products":
      componentToRender = <ProductList />;
      break;
    case "revenue":
      componentToRender = <Revenue />;
      break;
    case "emails":
      componentToRender = <Emails />;
      break;
    case "management":
      componentToRender = <Management />;
      break;
    default:
      componentToRender = <UserList />;
      break;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        setActiveComponent={setActiveComponent}
        activeComponent={activeComponent}
      />
      <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-200 shadow-inner min-h-screen">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md transition-all">
          {componentToRender}
        </div>
      </main>
    </div>
  );
};

export default withAuth(DashBoard);
