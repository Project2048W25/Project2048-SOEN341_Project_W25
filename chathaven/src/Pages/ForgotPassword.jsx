import React from "react";
import { Button } from "../components/Button";
import line3 from "../../public/icons/line-3.svg";
import slice1 from "../../public/icons/slice-1.svg";
import '../styles/tailwind.CSS/tailwind.css'

export const ForgotPassword = () => {
  return (
    <div className="bg-[#0e0e0e] flex flex-row justify-center w-full">
      <div className="bg-[#0e0e0e] overflow-hidden w-[1440px] h-[1024px] relative">
        <div className="absolute w-[517px] h-52 top-[380px] left-[60px]">
          <div className="absolute top-0 left-0 [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white text-8xl tracking-[0] leading-[normal]">
            ChatHaven
          </div>

          <div className="inline-flex items-start gap-2.5 px-6 py-3.5 absolute top-32 left-[9px] border-4 border-solid border-white">
            <p className="relative w-fit [font-family:'Noto_Sans-DisplaySemiBoldItalic',Helvetica] font-semibold italic text-white text-[32px] tracking-[0] leading-[normal]">
              Restore your account here.
            </p>
          </div>
        </div>

        <div className="absolute w-[642px] h-[964px] top-[62px] left-[798px]">
          <div className="absolute w-[302px] h-[302px] top-0 left-0 rounded-[151px] [background:linear-gradient(180deg,rgb(96.69,0,58.01)_0%,rgb(44.8,10.16,47.81)_100%)]" />

          <div className="absolute w-[220px] h-[220px] top-[705px] left-[383px] rounded-[110px] rotate-[-28.50deg] [background:linear-gradient(180deg,rgb(96.69,0,75.42)_0%,rgb(33.5,10.16,47.81)_100%)]" />

          <div className="absolute w-[482px] h-[798px] top-[51px] left-[101px] rounded-[20px] overflow-hidden border border-solid border-transparent shadow-[-8px_4px_5px_#0000003d] backdrop-blur-[53px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(53px)_brightness(100%)] [border-image:linear-gradient(to_bottom,rgb(255,255,255),rgba(0,0,0,0))_1] bg-glass1-fill-carey">
            <div className="inline-flex flex-col items-center gap-[29px] relative top-[97px] left-10">
              <div className="inline-flex flex-col items-start gap-[47px] relative flex-[0_0_auto]">
                <div className="inline-flex flex-col items-start gap-3.5 relative flex-[0_0_auto]">
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans-SemiBold',Helvetica] font-semibold text-white text-4xl tracking-[0] leading-[normal]">
                      Forgot Password ?
                    </div>

                    <div className="relative w-fit py-3 [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                      Please enter your email
                    </div>
                  </div>

                  <div className="inline-flex flex-col items-start gap-[25px] relative flex-[0_0_auto]">
                    <input
                        type="email"
                        placeholder="example@mail.com"

                        className="flex w-[400px] items-center gap-2.5 px-4 py-3.5  relative flex-[0_0_auto] rounded-md border border-solid border-white">

                    </input>

                    <div className="inline-flex flex-col items-center justify-center gap-3 relative flex-[0_0_auto]">
                      <Button
                        className="!flex-[0_0_auto]"
                        color="primary"
                        size="medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="inline-flex flex-col items-center justify-center gap-2 relative flex-[0_0_auto]">
                <a
                    href="/signup"
                className="relative  underline w-fit mt-[-1.00px] [font-family:'Noto_Sans-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                  Don’t have an account ? Signup
                </a>
              </div>
            </div>
          </div>
        </div>

        <img
          className="absolute w-[554px] h-0.5 top-9 left-[-383px]"
          alt="Line"
          src={line3}
        />

        <img
          className="absolute w-[100px] h-[100px] top-[-101px] left-[-129px]"
          alt="Slice"
          src={slice1}
        />

        <div className="absolute w-[97px] h-[57px] top-[433px] left-[591px]">
          <div className="relative h-[57px]">
            <div className="absolute w-[87px] h-[52px] top-0 left-2.5 bg-[#e6e7ec] rounded-[23px]" />

            <div className="absolute w-[13px] h-[13px] top-5 left-7 bg-[#9e9da2] rounded-[6.5px]" />

            <div className="absolute w-[13px] h-[13px] top-5 left-[47px] bg-[#b6b5ba] rounded-[6.5px]" />

            <div className="absolute w-[13px] h-[13px] top-5 left-[66px] bg-[#b6b5ba] rounded-[6.5px]" />

            <div className="absolute w-[21px] h-[19px] top-[33px] left-[7px] bg-[#e6e7ec] rounded-[10.5px/9.5px]" />

            <div className="absolute w-[9px] h-2 top-[49px] left-0 bg-[#e6e7ec] rounded-[4.5px/4px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
