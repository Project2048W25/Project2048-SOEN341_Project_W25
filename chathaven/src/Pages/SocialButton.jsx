import * as React from "react";
import "./index.css";
function SocialButton({ src, alt }) {
    return (
        <button
            type="button"
            className="focus:outline-none focus:ring-2 focus:ring-white"
        >
            <img
                loading="lazy"
                src={src}
                alt={alt}
                className="object-contain shrink-0 self-stretch my-auto aspect-square w-[42px]"
            />
        </button>
    );
}

export default SocialButton;