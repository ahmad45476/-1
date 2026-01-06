import { useState ,useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Camera } from "react-feather";
import axios from "axios";

const UserInfoCard = () => {
  
  const { currentUser} = useAuth();
  const [bio, setBio] = useState(currentUser?.artistProfile?.bio || "");
  const data = useEffect(() => {
    if (currentUser)
      setBio(currentUser.artistProfile.bio)
  },[currentUser])
  const [profileImage, setProfileImage] = useState();
  
  const [saveImage, setsaveImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // حفظ التعديلات
  const handleSave = async () => {
    try {
 const formData = new FormData();
        formData.append("image", saveImage);
        formData.append('userId',currentUser._id)
         const response = await axios.put(
          `http://localhost:5000/api/artist/${currentUser.artistProfile._id}`,
          formData,{
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
        );
         const responsee = await axios.put(
          `http://localhost:5000/api/artist/${currentUser.artistProfile._id}/bio`,
          {bio,userId:currentUser._id}
        );
  console.log(response);
  console.log(responsee);

      setIsModalOpen(false);
      window.alert("✅ تم حفظ التعديلات بنجاح");
    } catch (err) {
      console.error("Error updating profile:", err);
      window.alert("❌ فشل حفظ التعديلات");
    }
  };

   const handleProfileImageChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setProfileImage(file)
        setsaveImage(file)
        console.log(file);
      
        const preview = URL.createObjectURL(file);
        setProfileImage(preview);
  
       
   
};}
   

  return (
    <div className="bg-white rounded-xl shadow-md p-6 relative flex flex-col items-center">
      {/* صورة البروفايل */}
     {profileImage?(<img
          src={`${profileImage}`}
          alt={currentUser?.name || 'Profile'}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />):currentUser?(<img
          src={`http://localhost:5000${currentUser.profilePicture}`}
          alt={currentUser?.name || 'Profile'}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />):<img
          src={`http://localhost:5000`}
          alt={currentUser?.name || 'Profile'}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />}

      {/* الاسم + اليوزرنيم */}
      <h3 className="mt-4 text-xl font-bold text-gray-800">
        {currentUser?.name || ""}
      </h3>
          {currentUser?.username && (
        <p className="text-pink-800 text-2xl font-Chewy">
          {currentUser.username}
        </p>
      )}

      {/* البايو */}
      <div className="mt-4 text-center px-4">
        <p className="text-gray-700">{bio || "لم يتم إضافة بايو بعد"}</p>
      </div>

      {/* مكان البلد (فارغ مؤقتاً) */}
      <div className="mt-2 text-center px-4">
        <p className="text-gray-500 italic">[مكان البلد هنا لاحقاً]</p>
      </div>

      {/* زر تعديل الملف الشخصي */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-6 w-full px-4 py-2 bg-[#d5006d] text-white rounded-lg hover:bg-[#b0005a] transition"
      >
        تعديل الملف الشخصي
      </button>

      {/* زر إضافة عمل فني */}
      {currentUser?.role === "artist" && (
        <div className="mt-4 w-full">
          <Link
            to="/add-artwork"
            className="w-full px-4 py-2 bg-[#d5006d] text-white rounded-lg block text-center hover:bg-[#b0005a] transition"
          >
            إضافة عمل فني
          </Link>
        </div>
      )}

      {/* المودال */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-black/50 z-50">
          <div className="relative w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 h-3/4  overflow-hidden rounded-xl">
             <div className="relative bg-white rounded-xl p-6 overflow-y-auto shadow-xl z-10 h-full ">
            {/* الخطوط الدوارة حول المودال - الإصدار المصحح */}
            <div className="absolute inset-0 rounded-xl overflow-hidden z-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-pink-500 animate-move-right"></div>
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-pink-500 to-yellow-400 animate-move-down"></div>
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-yellow-400 to-blue-500 animate-move-left"></div>
              <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-blue-500 to-pink-500 animate-move-up"></div>
            </div>

            {/* المحتوى الداخلي للمودال */}
           
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-20"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-[#d5006d] text-center mb-6 relative z-10">
                تعديل الملف الشخصي
              </h2>

              {/* صورة الملف الشخصي */}
              <div className="flex justify-center mb-6 relative z-10">
                <div className="relative w-32 h-32">
                   {profileImage?(<img
          src={`${profileImage}`}
          alt={currentUser?.name || 'Profile'}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />):currentUser?(<img
          src={`http://localhost:5000${currentUser.profilePicture}`}
          alt={currentUser?.name || 'Profile'}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />):<img
          src={`http://localhost:5000`}
          alt={currentUser?.name || 'Profile'}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />}

                  <label className="absolute bottom-0 right-0 bg-[#d5006d] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-[#b0005a] transition z-20">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* البايو */}
              <div className="mb-4 relative z-10">
                <label className="block mb-2 font-semibold text-right">نبذة عنك</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                  className="w-full border p-2 rounded-lg text-gray-700 text-right relative z-20"
                />
                <p className="text-gray-400 text-sm mt-1 text-right">
                  اكتب نبذة مختصرة عن نفسك، مثل تخصصك أو أعمالك المفضلة
                </p>
              </div>

              <div className="flex justify-center gap-6 sm:mt-[40%] md:mt[35%] mt-[25%] relative z-10 ">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition relative z-20"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-[#d5006d] text-white rounded-lg hover:bg-[#b0005a] transition relative z-20"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* إضافة أنماط CSS مخصصة للتحكم في توقيت الحركة */}
      <style>
        {`
          @keyframes move-right {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes move-down {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes move-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          @keyframes move-up {
            0% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
          }
          .animate-move-right {
            animation: move-right 2s linear infinite;
          }
          .animate-move-down {
            animation: move-down 2s linear infinite;
            animation-delay: 1s;
          }
          .animate-move-left {
            animation: move-left 2s linear infinite;
            animation-delay: 2s;
          }
          .animate-move-up {
            animation: move-up 2s linear infinite;
            animation-delay: 3s;
          }
        `}
      </style>
    </div>
  );
};

export default UserInfoCard;