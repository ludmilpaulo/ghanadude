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
const UserStatistics = dynamic(() => import("./UserStatistics"), {
  ssr: false,
});
const LocationStatistics = dynamic(() => import("./LocationStatistics"), {
  ssr: false,
});

const DashBoard: React.FC = () => {
 // const [loading, setLoading] = useState(true);
 // const [user, setUser] = useState<User | null>(null);
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
        } else {
          console.log("user data", data);
         // setUser(data);
         // setLoading(false);
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
    case "user_statistics":
      componentToRender = <UserStatistics />;
      break;
    case "location_statistics":
      componentToRender = <LocationStatistics />;
      break;
    default:
      componentToRender = <UserList />;
      break;
  }

  return (
    <div className="flex">
      <Sidebar
        setActiveComponent={setActiveComponent}
        activeComponent={activeComponent}
      />
      <main
        className="flex-1 p-4 bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900
min-h-screen"
      >
        {componentToRender}
      </main>
    </div>
  );
};

export default withAuth(DashBoard);
