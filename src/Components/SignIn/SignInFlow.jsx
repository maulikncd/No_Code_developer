import React, { useState } from "react";

import SignInScreen from "./SignInScreen";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import ForgotPasswordOtp from "./ForgotPasswordOtp";
import ResetPassword from "./ResetPassword";
import PasswordSuccess from "./PasswordSuccess";

const SignInFlow = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");

    return (
        <>
            {step === 1 && (
                <SignInScreen
                    setStep={setStep}
                    setEmail={setEmail}
                />
            )}

            {step === 2 && (
                <ForgotPasswordScreen
                    setStep={setStep}
                    setEmail={setEmail}
                />
            )}

            {step === 3 && (
                <ForgotPasswordOtp
                    setStep={setStep}
                    email={email}
                />
            )}

            {step === 4 && (
                <ResetPassword
                    setStep={setStep}
                    email={email}
                />
            )}


            {step === 5 &&
                <PasswordSuccess
                    setStep={setStep}
                />
            }
        </>
    );
};

export default SignInFlow;
