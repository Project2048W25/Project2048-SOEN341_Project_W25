import PropTypes from "prop-types";
import React from "react";

export const TextField = ({ variant, className }) => {
  return <div className={`w-[185px] h-[27px] bg-white ${className}`} />;
};

TextField.propTypes = {
  variant: PropTypes.oneOf(["outlined"]),
};
