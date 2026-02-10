import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Brand from './pages/Brand';
import Collection from './pages/Collection';
import Category from './pages/Category';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Care from './pages/Care';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';

import { useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';

// Helper component to set language and render Home
const EnglishHome = () => {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage('en');
  }, [setLanguage]);

  return <Home />;
};

function App() {
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/en" element={<EnglishHome />} />
          <Route path="/brand" element={<Brand />} />
          <Route path="/collection/:id" element={<Collection />} />
          <Route path="/category/:type" element={<Category />} />
          <Route path="/care" element={<Care />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Route */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
