import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { RankingPage } from "./pages/RankingPage";
import { GroupsPage } from "./pages/GroupsPage";
import { KnockoutPage } from "./pages/KnockoutPage";
import { ParticipantPage } from "./pages/ParticipantPage";
import { MatchesPage } from "./pages/MatchesPage";

function App() {
  return (
    <BrowserRouter basename="/world-cup">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<RankingPage />} />
            <Route path="/grupos" element={<GroupsPage />} />
            <Route path="/eliminatoria" element={<KnockoutPage />} />
            <Route path="/partidos" element={<MatchesPage />} />
            <Route path="/participante/:id" element={<ParticipantPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
