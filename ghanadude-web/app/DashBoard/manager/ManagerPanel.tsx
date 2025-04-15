import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  getSiteSettings,
  updateSiteSettings,
  getAppVersions,
  updateAppVersion,
} from "@/services/ManagerService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Strictly typed site settings object
interface SiteSettings {
  brand_price: string;
  custom_price: string;
  delivery_fee: string;
  vat_percentage: string;
  address: string;
  country: string;
}

interface AppVersion {
  id: number;
  platform: string;
  latest_version: string;
  logo: string | File | null;
  store_url: string;
  force_update: boolean;
}

const ManagerPanel: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingVersions, setSavingVersions] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const siteData = await getSiteSettings();
        const versionData = await getAppVersions();
        setSettings(siteData);
        setVersions(versionData);
      } catch (err) {
        console.error("Failed to load manager data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (settings) {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleVersionTextChange = (
    index: number,
    field: "platform" | "latest_version" | "store_url",
    value: string
  ) => {
    const updated = [...versions];
    updated[index] = { ...updated[index], [field]: value };
    setVersions(updated);
  };

  const handleForceUpdateChange = (index: number, value: boolean) => {
    const updated = [...versions];
    updated[index] = { ...updated[index], force_update: value };
    setVersions(updated);
  };

  const handleLogoChange = (index: number, file: File | null) => {
    const updated = [...versions];
    updated[index] = { ...updated[index], logo: file };
    setVersions(updated);
  };

  const saveSettings = async () => {
    if (settings) {
      setSavingSettings(true);
      try {
        await updateSiteSettings(settings);
      } catch (err) {
        console.error("Failed to save settings:", err);
      } finally {
        setSavingSettings(false);
      }
    }
  };

  const saveAppVersion = async (version: AppVersion) => {
    const formData = new FormData();
    formData.append("platform", version.platform);
    formData.append("latest_version", version.latest_version);
    formData.append("store_url", version.store_url);
    formData.append("force_update", String(version.force_update));
    if (version.logo instanceof File) {
      formData.append("logo", version.logo);
    }

    setSavingVersions(version.id);
    try {
      await updateAppVersion(version.id, formData);
    } catch (err) {
      console.error("Failed to update app version:", err);
    } finally {
      setSavingVersions(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
        <span className="ml-2 text-gray-700">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">📦 Site Settings</h3>
      {settings && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(settings).map(([key, value]) =>
            key === "id" ? null : (
              <div key={key} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {key.replaceAll("_", " ")}
                </label>
                <Input
                  name={key}
                  value={value}
                  onChange={handleSettingsChange}
                  placeholder={key}
                />
              </div>
            )
          )}
        </div>
      )}
      <Button onClick={saveSettings} disabled={savingSettings}>
        {savingSettings ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin w-4 h-4" />
            Saving...
          </span>
        ) : (
          "Save Settings"
        )}
      </Button>

      <h3 className="text-xl font-bold mt-8">📱 App Versions</h3>
      <div className="space-y-6">
        {versions.map((ver, index) => (
          <div key={ver.id} className="border p-4 rounded shadow space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Platform</label>
              <Input
                value={ver.platform}
                onChange={(e) =>
                  handleVersionTextChange(index, "platform", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Latest Version
              </label>
              <Input
                value={ver.latest_version}
                onChange={(e) =>
                  handleVersionTextChange(index, "latest_version", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Store URL</label>
              <Input
                value={ver.store_url}
                onChange={(e) =>
                  handleVersionTextChange(index, "store_url", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Force Update
              </label>
              <input
                type="checkbox"
                checked={ver.force_update}
                onChange={(e) => handleForceUpdateChange(index, e.target.checked)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Logo</label>
              <div className="flex items-center gap-4">
                {ver.logo && typeof ver.logo === "string" && (
                  <div className="relative h-12 w-12">
                    <Image
                      src={ver.logo}
                      alt="logo"
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleLogoChange(index, e.target.files?.[0] || null)
                  }
                />
              </div>
            </div>
            <Button onClick={() => saveAppVersion(ver)} disabled={savingVersions === ver.id}>
              {savingVersions === ver.id ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Saving...
                </span>
              ) : (
                "Save Version"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerPanel;
