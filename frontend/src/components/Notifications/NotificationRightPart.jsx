import React from "react";
import Share from '../../assets/Share.mp4'

const NotificationRightPart = () => {
  return (
    <div className="h-screen ml-3 mt-2 mr-2">
      <div >
        <video className="w-full h-screen p-2" autoPlay muted loop>
          <source src={Share} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default NotificationRightPart;
