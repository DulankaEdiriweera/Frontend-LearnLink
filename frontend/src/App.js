//import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/HomePage/Home';
import SkillSharingFeed from './components/SkillSharingPosts/SkillSharingFeed';
import Login from './components/LoginandSignUp/Login';
import SignUp from './components/LoginandSignUp/SignUp';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/skillSharingFeed' element={<SkillSharingFeed/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<SignUp/>}/>
      </Routes>
    </div>
  );
}

export default App;
