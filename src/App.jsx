import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Loading } from "./components/common/Loading";
import "./App.css";

const Home = lazy(() => import("./pages/home"));
const Forum = lazy(() => import("./pages/forum"));
const Auth = lazy(() => import("./pages/auth"));
const Premium = lazy(() => import("./pages/premium"));
const ForumVW = lazy(() => import("./pages/forumvw"));
const ForumSkoda = lazy(() => import("./pages/forumskoda"));
const ForumSeat = lazy(() => import("./pages/forumseat"));
const ForumAudi = lazy(() => import("./pages/forumaudi"));
const Code = lazy(() => import("./pages/code"));
const Register = lazy(() => import("./pages/reg"));
const VerifyRegistration = lazy(() => import("./pages/verify-registration"));
const Profile = lazy(() => import("./pages/profile"));
const Aszf = lazy(() => import("./pages/aszf"));
const Tuning = lazy(() => import("./pages/tuning"));
const PostDetail = lazy(() => import("./components/forum/PostDetail"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="app-main">
            <Suspense fallback={<Loading />}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/post/:postId" element={<PostDetail />} />
              <Route path="/forum/vw" element={<ForumVW />} />
              <Route path="/forum/skoda" element={<ForumSkoda />} />
              <Route path="/forum/seat" element={<ForumSeat />} />
              <Route path="/forum/audi" element={<ForumAudi />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/tuning" element={<ProtectedRoute><Tuning /></ProtectedRoute>} />
              <Route path="/code" element={<Code />} />
              <Route path="/reg" element={<Register />} />
              <Route path="/verify-registration" element={<VerifyRegistration />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/aszf" element={<Aszf />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
