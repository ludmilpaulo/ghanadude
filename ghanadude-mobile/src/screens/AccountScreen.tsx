import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import tw from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectUser, selectToken } from "../redux/slices/authSlice";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import {
  fetchRewards,
  fetchUserProfile,
  updateUserProfile,
  ProfileForm,
} from "../services/UserService";
import { fetchAndPrefillLocation } from "../services/LocationService";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/HomeNavigator";
import { BlurView } from "expo-blur";
import {
  restoreUserAccountById,
  deleteUserAccountById,
} from "../services/UserAuth";
import axios from "axios";
import Constants from "expo-constants";
import { API_BASE_URL } from "../services/AuthService";

type NavigationProp = StackNavigationProp<HomeStackParamList>;

const AccountScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  interface Rewards {
    reward_balance: string;
  }

  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false); // 🆕
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });

  const ensureAuth = useCallback(() => {
    if (!user || !token) {
      Alert.alert("Error", "You must be logged in.");
      navigation.navigate("UserLogin");
      return null;
    }
    return { user, token };
  }, [user, token]);

  useEffect(() => {
    if (showGoodbye) {
      const timeout = setTimeout(() => {
        dispatch(logoutUser());
      }, 3000);
      navigation.navigate("UserLogin");
      return () => clearTimeout(timeout);
    }
  }, [showGoodbye]);

  useFocusEffect(
    useCallback(() => {
      const auth = ensureAuth();
      if (auth) {
        loadRewards();
        updateAppVersion(); // 👈 track version on server
      }
    }, [ensureAuth])
  );
  

 

  const loadRewards = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    try {
      const res = await fetchRewards(auth.user.user_id);
      setRewards(res);
    } catch {
      Alert.alert("Error", "Failed to load rewards");
    }
  };

  const updateAppVersion = async () => {
    if (!user?.user_id) return;
  
    const version = Constants.expoConfig?.version ?? "1.0.0";
    try {
      await axios.patch(`${API_BASE_URL}/api/users/${user.user_id}/update-version/`, {
        app_version: version,
      });
    } catch (err) {
      console.warn("Failed to update app version:", err);
    }
  };
  

  const loadProfileData = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    setLoadingProfile(true); // 🆕
    try {
      const res = await fetchUserProfile(auth.user.user_id);
      const { first_name, last_name, email, profile } = res;

      setProfileForm({
        name: `${first_name} ${last_name}`,
        first_name,
        last_name,
        email,
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        city: profile.city || "",
        postal_code: profile.postal_code || "",
        country: profile.country || "",
      });

      const location = await fetchAndPrefillLocation();
      if (location) {
        setProfileForm((prev) => ({
          ...prev,
          ...location,
        }));
      }

      setProfileModalVisible(true);
    } catch {
      Alert.alert("Error", "Could not load profile");
    } finally {
      setLoadingProfile(false); // 🆕
    }
  };

  const handleProfileUpdate = async () => {
    const auth = ensureAuth();
    if (!auth) return;

    setUpdatingProfile(true);
    try {
      await updateUserProfile(auth.user.user_id, profileForm);
      Alert.alert("Success", "Profile updated");
      setProfileModalVisible(false);
    } catch {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => dispatch(logoutUser()),
      },
    ]);
    navigation.navigate("UserLogin");
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`bg-blue-700 py-10 px-5 rounded-b-3xl shadow-md`}>
        <Text style={tw`text-3xl font-bold text-white text-center`}>
          My Account
        </Text>
      </View>

      {/* Rewards Card */}
      <View style={tw`mt-6 mx-4 bg-white shadow-lg rounded-xl p-5`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>🎁 Rewards</Text>
        {rewards ? (
          <>
            <Text>
              Available Reward Balance:{" "}
              <Text style={tw`font-bold text-green-700`}>
                R{parseFloat(rewards.reward_balance).toFixed(2)}
              </Text>
            </Text>
            <Text style={tw`text-sm text-gray-500 mt-1`}>
              Your reward balance will be automatically applied at checkout.
            </Text>
          </>
        ) : (
          <ActivityIndicator size="small" color="#4A5568" />
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("OrderHistory")}
          style={tw`mt-4 bg-blue-700 py-3 rounded-xl`}
        >
          <Text style={tw`text-white text-center font-bold text-base`}>
            📦 View My Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={tw`mt-6 mx-4 bg-white shadow-lg rounded-xl`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-between py-4 px-5 border-b border-gray-200`}
          onPress={loadProfileData}
        >
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="user" size={20} color="#4A5568" />
            <Text style={tw`text-lg text-gray-700 ml-4`}>
              Profile Information
            </Text>
          </View>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={24}
            color="#4A5568"
          />
        </TouchableOpacity>
      </View>

      {/* Restore Button */}
      {user?.profile?.is_deleted && (
        <TouchableOpacity
          style={tw`flex-row items-center justify-center bg-yellow-500 py-4 rounded-xl shadow-md m-4`}
          onPress={async () => {
            try {
              await restoreUserAccountById(user.user_id);
              Alert.alert("Account Restored", "Please log in again.");
              dispatch(logoutUser());
            } catch {
              Alert.alert("Error", "Could not restore account");
            }
          }}
        >
          <MaterialIcons name="restore" size={22} color="white" />
          <Text style={tw`text-white font-bold ml-2`}>Restore My Account</Text>
        </TouchableOpacity>
      )}

      {/* Delete Button */}
      <TouchableOpacity
        style={tw`flex-row items-center justify-center bg-red-600 py-4 rounded-xl shadow-md m-4`}
        onPress={() => setShowDeleteModal(true)}
      >
        <MaterialIcons name="delete-forever" size={22} color="white" />
        <Text style={tw`text-white font-bold ml-2`}>Delete My Account</Text>
      </TouchableOpacity>

      {/* Goodbye Modal */}
      <Modal visible={showGoodbye} transparent animationType="fade">
        <View style={tw`flex-1 justify-center items-center`}>
          <BlurView intensity={60} tint="light" style={tw`absolute inset-0`} />
          <View
            style={tw`bg-white w-11/12 p-6 rounded-2xl shadow-2xl z-10 items-center`}
          >
            <FontAwesome5 name="smile-wink" size={48} color="#16a34a" />
            <Text style={tw`text-2xl font-bold mt-4 text-green-700`}>
              Goodbye!
            </Text>
            <Text style={tw`text-center text-gray-600 mt-3 mb-5`}>
              Your account has been successfully deleted. We hope to see you
              again soon!
            </Text>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={tw`text-sm text-gray-400 mt-2`}>
              Logging you out...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={tw`flex-1 justify-center items-center`}>
          <BlurView intensity={60} tint="light" style={tw`absolute inset-0`} />
          <View style={tw`bg-white w-11/12 p-6 rounded-2xl shadow-2xl z-10`}>
            <Text style={tw`text-xl font-bold text-center mb-4 text-red-600`}>
              Confirm Account Deletion
            </Text>
            <Text style={tw`text-base text-center mb-5 text-gray-700`}>
              This will deactivate your account. You can restore it later, but
              you will be logged out immediately.
            </Text>
            <TouchableOpacity
              onPress={async () => {
                const auth = ensureAuth();
                if (!auth) return;
                try {
                  setDeleting(true);
                  await deleteUserAccountById(auth.user.user_id);
                  setShowDeleteModal(false);
                  setShowGoodbye(true);
                } catch {
                  Alert.alert("Error", "Failed to delete account");
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              style={tw`bg-red-600 py-3 rounded-lg mb-3`}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white text-center font-bold`}>
                  Yes, Delete My Account
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(false)}
              style={tw`py-2`}
            >
              <Text style={tw`text-center text-blue-600 font-semibold`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout */}
      <View style={tw`mt-6 mx-4 mb-10`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-center bg-red-500 py-4 rounded-xl shadow-md`}
          onPress={handleLogout}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="white" />
          <Text style={tw`text-lg font-semibold text-white ml-3`}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Spinner while loading profile */}
      {loadingProfile && (
        <View style={tw`absolute inset-0 z-50`}>
          <BlurView intensity={50} tint="light" style={tw`absolute inset-0`} />
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        </View>
      )}

      {/* Profile Modal */}
      <Modal visible={profileModalVisible} animationType="fade" transparent>
        <View style={tw`flex-1 justify-center items-center`}>
          <BlurView intensity={60} tint="light" style={tw`absolute inset-0`} />

          <View style={tw`bg-white w-11/12 p-6 rounded-2xl shadow-2xl z-10`}>
            <Text style={tw`text-2xl font-bold mb-4 text-center`}>
              Edit Profile
            </Text>

            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="First Name"
              value={profileForm.first_name}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, first_name: text }))
              }
            />
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="Last Name"
              value={profileForm.last_name}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, last_name: text }))
              }
            />
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="Email"
              value={profileForm.email}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, email: text }))
              }
            />
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="Phone Number"
              value={profileForm.phone_number}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, phone_number: text }))
              }
            />
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="Address"
              value={profileForm.address}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, address: text }))
              }
            />
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="City"
              value={profileForm.city}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, city: text }))
              }
            />
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="Postal Code"
              value={profileForm.postal_code}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, postal_code: text }))
              }
            />
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg mb-3`}
              placeholder="Country"
              value={profileForm.country}
              onChangeText={(text) =>
                setProfileForm((prev) => ({ ...prev, country: text }))
              }
            />

            <TouchableOpacity
              style={tw`bg-blue-600 py-3 rounded-lg mb-2`}
              onPress={handleProfileUpdate}
            >
              <Text style={tw`text-white text-center font-bold`}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setProfileModalVisible(false)}
              style={tw`py-2`}
            >
              <Text style={tw`text-center text-blue-600`}>Cancel</Text>
            </TouchableOpacity>

            {updatingProfile && (
              <View
                style={tw`absolute inset-0 z-50 bg-black/30 justify-center items-center rounded-2xl`}
              >
                <View style={tw`bg-white p-4 rounded-full shadow-lg`}>
                  <ActivityIndicator size="large" color="#2563EB" />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AccountScreen;
