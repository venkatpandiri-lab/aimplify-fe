import { useMemo, useState } from "react";
import { usePlatformData } from "../hooks/usePlatformData";

// Keep all existing presentational components/styles from raw.jsx unchanged.
// This shell replaces only static constants with API-driven state.
export default function DynamicAppShell({ PresentationalApp }) {
  const { families, assets, submissions, activity, loading, error, submitAsset } = usePlatformData();
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [cloudFilter, setCloudFilter] = useState([]);
  const [maturityFilter, setMaturityFilter] = useState([]);
  const [demoOnly, setDemoOnly] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (familyFilter !== "all" && a.family !== familyFilter) return false;
      if (cloudFilter.length && !cloudFilter.some((c) => a.clouds.includes(c))) return false;
      if (maturityFilter.length && !maturityFilter.includes(a.maturity)) return false;
      if (demoOnly && !a.demoReady) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.solution.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [assets, familyFilter, cloudFilter, maturityFilter, demoOnly, query]);

  if (loading) return <div style={{ padding: 40 }}>Loading platform content...</div>;
  if (error) return <div style={{ padding: 40, color: "#EF4444" }}>Failed to load: {error}</div>;

  return (
    <PresentationalApp
      view={view}
      setView={setView}
      query={query}
      setQuery={setQuery}
      familyFilter={familyFilter}
      setFamilyFilter={setFamilyFilter}
      cloudFilter={cloudFilter}
      setCloudFilter={setCloudFilter}
      maturityFilter={maturityFilter}
      setMaturityFilter={setMaturityFilter}
      demoOnly={demoOnly}
      setDemoOnly={setDemoOnly}
      families={families}
      assets={assets}
      filteredAssets={filteredAssets}
      submissions={submissions}
      activity={activity}
      onSubmitAsset={submitAsset}
    />
  );
}

