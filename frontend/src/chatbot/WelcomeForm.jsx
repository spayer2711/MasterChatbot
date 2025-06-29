import React, { useState } from "react";
import "./welcome.css";

function WelcomeForm({ submitWelomeForm, setShowWelcomeForm }) {
    const [userInfo, setUserInfo] = useState({ name: "", email: "" });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!userInfo.name.trim()) newErrors.name = "Name is required";
        if (!userInfo.email.trim()) {
            // newErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(userInfo.email)
        ) {
            newErrors.email = "Invalid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStart = () => {
        if (!validate()) return;

        // Clear errors
        setErrors({});
        submitWelomeForm(userInfo);
        setShowWelcomeForm(false)

    };

    return (
        <div className="welcome-form-overlay">
            <div className="welcome-form">
                <h2>Welcome! 👋</h2>
                <p>Please tell us a bit about you before we begin:</p>
                <div className="form-grp">
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={userInfo.name}
                        onChange={(e) => {
                            setUserInfo({ ...userInfo, name: e.target.value });
                            setErrors((prev) => ({ ...prev, name: null }));
                        }}
                    />
                    {errors.name && <div className="error-msg">{errors.name}</div>}
                </div>
                <div className="form-grp">
                    <input
                        type="email"
                        placeholder="Your Email"
                        value={userInfo.email}
                        onChange={(e) => {
                            setUserInfo({ ...userInfo, email: e.target.value });
                            setErrors((prev) => ({ ...prev, email: null }));
                        }}
                    />
                    {errors.email && <div className="error-msg">{errors.email}</div>}
                </div>

                <button className="primary-btn" onClick={handleStart}>
                    Start Chat
                </button>
            </div>
        </div>
    );
}

export default WelcomeForm;
