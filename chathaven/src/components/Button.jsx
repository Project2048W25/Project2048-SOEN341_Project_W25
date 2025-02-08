import PropTypes from "prop-types";
import React from "react";

export const Button = ({ color, size, className }) => {
  return (
    <button
      className={`all-[unset] box-border flex w-[400px] items-center justify-center gap-2.5 px-2.5 py-3.5 relative rounded-xl [background:linear-gradient(180deg,rgb(232.69,71.75,197.28)_0%,rgb(205.06,64.08,123.29)_53.12%,rgb(116.88,3.9,44.57)_100%)] ${className}`}
    >
      <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-xl tracking-[0] leading-[normal]">
        Reset Password
      </div>
    </button>
  );
};

Button.propTypes = {
  color: PropTypes.oneOf(["primary"]),
  size: PropTypes.oneOf(["medium"]),
};
