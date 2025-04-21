import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { useSelector } from "react-redux";
import { getUserCoupons } from "../services/CouponService";
import { selectUser } from "../redux/slices/authSlice";
import tw from "twrnc";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";

type FilterType = "all" | "active" | "redeemed" | "expired";
type SortType = "newest" | "oldest" | "expiry";

const MyCouponsScreen = () => {
  const user = useSelector(selectUser);
  const token = useSelector((state: any) => state.auth.token);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const res = await getUserCoupons(token);
        const enriched = res.map((coupon: any) => ({
          ...coupon,
          is_expired: new Date(coupon.expires_at) < new Date(),
        }));
        setCoupons(enriched);
      } catch {
        alert("Failed to load coupons");
      } finally {
        setLoading(false);
      }
    };
    loadCoupons();
  }, []);

  useEffect(() => {
    let filteredList = [...coupons];

    if (filter === "active") {
      filteredList = filteredList.filter(
        (c) => !c.is_redeemed && !c.is_expired,
      );
    } else if (filter === "redeemed") {
      filteredList = filteredList.filter((c) => c.is_redeemed);
    } else if (filter === "expired") {
      filteredList = filteredList.filter((c) => c.is_expired);
    }

    if (sort === "newest") {
      filteredList.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (sort === "oldest") {
      filteredList.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    } else if (sort === "expiry") {
      filteredList.sort(
        (a, b) =>
          new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime(),
      );
    }

    setFiltered(filteredList);
  }, [coupons, filter, sort]);

  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied", "Coupon code copied to clipboard!");
  };

  const handleShare = async (code: string) => {
    try {
      await Share.share({ message: `Use this coupon code and save: ${code}` });
    } catch {
      Alert.alert("Error", "Unable to share coupon");
    }
  };

  const renderStatusBadge = (coupon: any) => {
    if (coupon.is_expired)
      return (
        <Text style={tw`text-xs bg-red-500 text-white px-2 py-1 rounded-full`}>
          Expired ⛔
        </Text>
      );
    if (coupon.is_redeemed)
      return (
        <Text style={tw`text-xs bg-gray-500 text-white px-2 py-1 rounded-full`}>
          Used ✅
        </Text>
      );
    return (
      <Text style={tw`text-xs bg-green-600 text-white px-2 py-1 rounded-full`}>
        Active 🎉
      </Text>
    );
  };

  return (
    <ScrollView style={tw`flex-1 bg-white p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>🎟️ My Coupons</Text>

      {/* Filters */}
      <View style={tw`flex-row flex-wrap mb-3`}>
        {["all", "active", "redeemed", "expired"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f as FilterType)}
            style={tw`mr-2 mb-2 px-3 py-1 rounded-full ${filter === f ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <Text style={tw`${filter === f ? "text-white" : "text-black"}`}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort */}
      <View style={tw`flex-row mb-4`}>
        {["newest", "oldest", "expiry"].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSort(s as SortType)}
            style={tw`mr-2 px-3 py-1 rounded-full ${sort === s ? "bg-green-600" : "bg-gray-300"}`}
          >
            <Text style={tw`${sort === s ? "text-white" : "text-black"}`}>
              {s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coupons List */}
      {loading ? (
        <ActivityIndicator size="large" color="gray" />
      ) : filtered.length === 0 ? (
        <Text style={tw`text-gray-600`}>No coupons match your filters.</Text>
      ) : (
        filtered.map((coupon, index) => (
          <View
            key={index}
            style={tw`p-4 border border-gray-300 rounded-lg mb-4 ${coupon.is_redeemed || coupon.is_expired ? "bg-gray-100" : "bg-green-100"}`}
          >
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`text-lg font-bold`}>{coupon.code}</Text>
              {renderStatusBadge(coupon)}
            </View>
            <Text style={tw`text-gray-700`}>Value: R{coupon.value}</Text>
            <Text style={tw`text-gray-600`}>
              Expiry: {new Date(coupon.expires_at).toLocaleDateString()}
            </Text>

            <View style={tw`flex-row mt-2`}>
              <TouchableOpacity
                onPress={() => handleCopy(coupon.code)}
                style={tw`mr-4`}
              >
                <MaterialIcons name="content-copy" size={20} color="#4A5568" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShare(coupon.code)}>
                <MaterialIcons name="share" size={20} color="#4A5568" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default MyCouponsScreen;
