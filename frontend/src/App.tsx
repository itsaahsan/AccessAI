import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Understand from "./pages/Understand";
import StudyPlanPage from "./pages/StudyPlan";
import ProgressPage from "./pages/Progress";
import History from "./pages/History";
import Settings from "./pages/Settings";
import type { View } from "./lib/types";
import { applyA11y, useAppState } from "./lib/store";

export default function App() {
  const { profile, a11y } = useAppState();
  const [view, setView] = useState<View>(profile ? "dashboard" : "landing");

  useEffect(() => {
    applyA11y(a11y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const gated: View = !profile && view !== "landing" && view !== "onboarding" ? "landing" : view;

  return (
    <Layout view={gated} go={go}>
      {gated === "landing" && <Landing go={go} />}
      {gated === "onboarding" && <Onboarding go={go} />}
      {gated === "dashboard" && <Dashboard go={go} />}
      {gated === "understand" && <Understand />}
      {gated === "plan" && <StudyPlanPage />}
      {gated === "progress" && <ProgressPage />}
      {gated === "history" && <History />}
      {gated === "settings" && <Settings />}
    </Layout>
  );
}
