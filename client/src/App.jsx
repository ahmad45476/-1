import {Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import LoginPage from './Pages/LoginPage';
import ProfilePage from './Pages/ProfilePage';
import Explore from "./Pages/Explore";
import ArtworkDetail from "./Pages/ArtworkDetail";
import AddArtwork from './Components/AddArtwork';
import EditArtwork from './Components/EditArtwork';
import Register from './Components/Register';
import Login from './Components/Login';
import ArtistProfile from './Components/ArtistProfile';
import AdminDashboard from './Pages/admin/AdminDashboard';
import ALogin from './Pages/admin/ALogin';
import ArtistsPage from './Pages/ArtistsPage';
import SuperAdminDashboard from './Pages/admin/SuperAdminDashboard';
import { ArtworkProvider } from './context/ArtworkContext'; // تأكد من المسار الصحيح
import { AuthProvider } from './context/AuthContext';



// أضف هذا المسار


function App() {
  return (
   
     <AuthProvider>
    <ArtworkProvider>
    <Routes>
      <Route path="/" element={<Home />} />
       <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="auth" element={<LoginPage />} />
        <Route path='/admin/login' element={<ALogin/>} />
         <Route path='/admin/dashboard' element={<AdminDashboard/>} />
          <Route path='/admin/super-dashboard' element={<SuperAdminDashboard />} />
             <Route path="/artist/:id" element={<ArtistProfile />} />
      <Route path='profile' element={<ProfilePage/>}/>
      <Route path="/explore" element={<Explore />} />
      <Route path="/artwork/:id" element={<ArtworkDetail />} />
      <Route path="/add-artwork" element={<AddArtwork />} />
      <Route path="/edit-artwork/:id" element={<EditArtwork />} />
      <Route path="/artists" element={<ArtistsPage />} />
    
    </Routes>
     </ArtworkProvider>
     </AuthProvider>
    
  );
}

export default App;