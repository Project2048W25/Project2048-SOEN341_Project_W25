import * as React from "react";
function FormInput({ type, id, placeholder, label, icon }) {
    return (
        <div className="relative">
            <label htmlFor={id} className="sr-only">{label}</label>
            <div className="flex gap-10 justify-between items-center px-4 py-3.5 w-full text-xl whitespace-nowrap rounded-xl border border-white border-solid">
                <input
                    type={type}
                    id={id}
                    placeholder={placeholder}
                    className="bg-transparent border-none outline-none text-white w-full"
                    aria-label={label}
                />
                {icon && (
                    <img
                        loading="lazy"
                        src={icon}
                        alt=""
                        className="object-contain shrink-0 self-stretch my-auto aspect-square w-[18px]"
                    />
                )}
            </div>
        </div>
    );
}

export default FormInput;