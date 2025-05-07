//import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/HomePage/Home';
import SkillSharingFeed from './components/SkillSharingPosts/SkillSharingFeed';
import Login from './components/LoginandSignUp/Login';
import SignUp from './components/LoginandSignUp/SignUp';
import LearningPlanFeed from './components/LearningPlanSharing/LearningPlanSharingFeed';
import GoalTrackingFeed from './components/GoalTracking/GoalTrackingFeed';
import Profile from './components/Profile/Profile';
import EditProfile from './components/Profile/EditProfile';
import LearningProgressFeed from './components/LearningProgressPost/LearningProgressFeed';
import Notifications from './components/Notifications/Notification.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/skillSharingFeed' element={<SkillSharingFeed/>}/>
        <Route path='/learningPlanSharingFeed' element={<LearningPlanFeed/>}/>
        <Route path='/learningProgressFeed' element={<LearningProgressFeed/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path='/Notification' element={<Notifications/>}/>
      </Routes>
    </div>
  );
}

export default App;
