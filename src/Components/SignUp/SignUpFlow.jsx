import React, { useState } from "react";
import SignUp from "./SignUp";
import SignOtp from "./sign-otp";

const SignUpFlow = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");

    return (
        <>
            {step === 1 && <SignUp setStep={setStep} setEmail={setEmail} />}
            {step === 2 && <SignOtp setStep={setStep} email={email} />}
        </>
    );
};

export default SignUpFlow;
