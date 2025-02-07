import * as React from "react";
function FooterLink({ href, text }) {
    return (
        <a
            href={href}
            className="gap-2.5 self-stretch my-auto hover:underline focus:outline-none focus:ring-2 focus:ring-white"
        >
            {text}
        </a>
    );
}

export default FooterLink;