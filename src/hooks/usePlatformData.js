import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export function usePlatformData() {
  const [families, setFamilies] = useState({});
  const [assets, setAssets] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");
    try {
      const data = await api.getBootstrap();
      setFamilies(data.families || {});
      setAssets(data.assets || []);
      setSubmissions(data.submissions || []);
      setActivity(data.activity || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed loading platform data");
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  const submitAsset = useCallback(
    async (payload) => {
      const created = await api.createSubmission(payload);
      setSubmissions((prev) => [created, ...prev]);
      return created;
    },
    [setSubmissions]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    families,
    assets,
    submissions,
    activity,
    loading,
    refreshing,
    error,
    reload: load,
    submitAsset,
  };
}

