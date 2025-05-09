import { FaHome } from "react-icons/fa";
import { SiFuturelearn } from "react-icons/si";
import { GiSkills } from "react-icons/gi";
import { GoGoal } from "react-icons/go";
import { GiProgression } from "react-icons/gi";
import { IoIosNotifications } from "react-icons/io";
import { CgProfile } from "react-icons/cg";

export const navigation =[
    {
        title:"Home",
        icon : <FaHome />,
        path : '/'

    },
    {
        title:"Share Skills",
        icon : <GiSkills />,
        path : '/skillSharingFeed'

    },
    {
        title:"Share Learning Plans",
        icon : <SiFuturelearn />,
        path : '/learningPlanSharingFeed'

    },
    {
        title:"Goal Tracking",
        icon : <GoGoal />,
        path : '/goalTrackingFeed'

    },
    {
        title:"Share Progress Updates",
        icon : <GiProgression />,
        path : '/learningProgressFeed'

    },
    {
        title:"Notifications",
        icon : <IoIosNotifications />,
         path : '/Notification'

    },
    {
        title:"Profile",
        icon : <CgProfile />,
        path : '/profile'

    },
]