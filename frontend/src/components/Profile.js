import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
    const [bio, setBio] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState("");

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/user/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBio(response.data.bio);
            setProfilePictureUrl(response.data.profile_picture);
        } catch (err) {
            console.error(err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("bio", bio);
            if (profilePicture) formData.append("profile_picture", profilePicture);

            await axios.post("http://localhost:5000/api/user/profile", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            alert("Profile updated successfully!");
            fetchUserProfile();
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        }
    };

    return (
        <div>
            <h1>User Profile</h1>
            <form onSubmit={handleProfileUpdate}>
                <label>
                    Bio:
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                </label>
                <label>
                    Profile Picture:
                    <input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
                </label>
                {profilePictureUrl && <img src={`http://localhost:5000${profilePictureUrl}`} alt="Profile" />}
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default Profile;
