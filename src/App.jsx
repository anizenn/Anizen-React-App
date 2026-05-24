import { useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { HomeInfoProvider } from "./context/HomeInfoContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import Home from "./pages/Home/Home";
import AnimeInfo from "./pages/animeInfo/AnimeInfo";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Error from "./components/error/Error";
import Category from "./pages/category/Category";
import AtoZ from "./pages/a2z/AtoZ";
import { azRoute, categoryRoutes } from "./utils/category.utils";
import "./App.css";
import Search from "./components/search/Search";
import Watch from "./pages/watch/Watch";
import Producer from "./components/producer/Producer";
import SplashScreen from "./components/splashscreen/SplashScreen";
import AuthModal from "./components/auth/AuthModal";
import Maintenance from "./components/maintenance/Maintenance";
import Profile from "./pages/profile/Profile";
const MAINTENANCE = import.meta.env.VITE_MAINTENANCE_MODE === "true";
function GenreRoute() {
  const {
    genre
  } = useParams();
  const path = `genre/${genre}`;
  const label = genre.split("-").join(" ");
  return <Category path={path} label={label} />;
}
function Layout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  const isSplashScreen = location.pathname === "/";
  return <div className="app-container">
      <main className={isSplashScreen ? "" : "main-content"}>
        {!isSplashScreen && <Navbar />}
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/home" element={<Home />} />
          <Route path="/:id" element={<AnimeInfo />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/random" element={<AnimeInfo random={true} />} />
          <Route path="/404-not-found-page" element={<Error error="404" />} />
          <Route path="/error-page" element={<Error />} />
          <Route path="/genre/:genre" element={<GenreRoute />} />
          {categoryRoutes.filter(path => !path.startsWith("genre/")).map(path => <Route key={path} path={`/${path}`} element={<Category path={path} label={path.split("-").join(" ")} />} />)}
          {azRoute.map(path => <Route key={path} path={`/${path}`} element={<AtoZ path={path} />} />)}
          <Route path="/producer/:id" element={<Producer />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="*" element={<Error error="404" />} />
        </Routes>
        {!isSplashScreen && <Footer />}
      </main>
    </div>;
}
function AppContent() {
  if (MAINTENANCE) return <Maintenance />;
  return <>
      <Routes>

        <Route path="*" element={<Layout />} />
      </Routes>
      <AuthModal />
    </>;
}
function App() {
  return <AuthProvider>
      <AuthModalProvider>
        <HomeInfoProvider>
          <AppContent />
        </HomeInfoProvider>
      </AuthModalProvider>
    </AuthProvider>;
}
export default App;
