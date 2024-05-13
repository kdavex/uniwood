import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../providers/UserInfoProvider';
import {
  LogoutRounded,
} from "@mui/icons-material";
import HomeIcon from '../assets/images/home.svg';
import NotifIcon from '../assets/images/notification.svg';
import ProfileIcon from '../assets/images/profile.svg';
import MessageIcon from '../assets/images/message.svg';
import ArticleIcon from '../assets/images/article.svg';
import SearchIcon from '../assets/images/search.svg';
import LogoIcon from '../assets/images/logo_label.svg';
import Cookies from "js-cookie";

interface FocustStateProps {
    home: boolean;
    messages: boolean;
    notifications: boolean;
    profile: boolean;
    uniVault: boolean;
}

const Navmob = () => {

    const { userInfo } = useContext(UserInfoContext)!;
    const navigate = useNavigate();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const goToProfile = () => {
        setIsProfileMenuOpen(false);
        navigate(`/profile/${userInfo.username}`);
    };

    const logout = () => {
      Cookies.remove("refresh_token");
      localStorage.clear();
      navigate("/login");
  };

    return (
        <div className="relative pt-40 pb-12 custom2:block custom:hidden">
            <div className="fixed top-0 left-0 right-0 border-b-4 border-gray-300 bg-[#f0f2f5] z-20 flex items-end custom2:block custom:hidden">
                <div className="flex justify-end flex-1">
                    <img src={LogoIcon} alt="Logo" className="ml-14 size-48" />
                    <Link to="/message" className="nav-item text-right ml-auto">
                        <img src={MessageIcon} alt="Messaging" className="mr-10 mt-14 mx-auto size-24" />
                    </Link>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 border-t-4 border-gray-300 bg-[#f0f2f5] z-10 flex items-center custom2:block custom:hidden p-5">
                <Link to="/" className="nav-item flex-1 text-center">
                    <img src={HomeIcon} alt="Home" className="mx-auto size-24" />
                </Link>
                <Link to="/notification" className="nav-item flex-1 text-center">
                    <img src={NotifIcon} alt="Notifications" className="mx-auto size-24" />
                </Link>
                <div className="nav-item flex-1 text-center" onClick={() => console.log('Search clicked')}>
                    <img src={SearchIcon} alt="Search" className="mx-auto size-36" />
                </div>
                <Link to="/univault" className="nav-item flex-1 text-center">
                    <img src={ArticleIcon} alt="Article" className="mx-auto size-24" />
                </Link>
                <div className="nav-item flex-1 text-center relative" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                    <img src={ProfileIcon} alt="Profile" className="mx-auto size-24 cursor-pointer" />
                    {isProfileMenuOpen && (
                        <div className="text-6xl mb-5 custom2:text-3xl absolute right-0 rounded-3xl bottom-full bg-white border-8 border-dashed border-black p-8 shadow-lg">
                            <ul>
                                <li className="cursor-pointer mb-10" onClick={goToProfile}>Profile</li>
                                <li className="cursor-pointer" onClick={logout}>Logout</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navmob;

