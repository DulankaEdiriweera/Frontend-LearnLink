import React from 'react'
import Painting from '../../assets/Painting.mp4'

const SkillSharingRightPart = () => {
  return (
    <div className="h-screen ml-3 mt-2 mr-2">
      <div className="grid grid-cols-1 gap-4">
          {/*<video className="w-full rounded-lg shadow-md" autoPlay muted loop>
            <source
              src={Sing}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <video className="w-full rounded-lg shadow-md" autoPlay muted loop>
            <source
              src={CookingVideo}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>*/}
          <video className="w-full h-screen p-2" autoPlay muted loop>
            <source
              src={Painting}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
    </div>
  )
}

export default SkillSharingRightPart
