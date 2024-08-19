"use client";

import type { MenuType } from "~/utils/types";
import { Icon } from "./icon";

interface IconButtonProps {
  src: string;
  text: string;
  color: string;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
}

export function IconButton(props: IconButtonProps) {
  return (
    <button
      onClick={() => props.setActiveMenu(props.text.toLowerCase() as MenuType)}
      className={`flex w-full items-center justify-center gap-3 text-nowrap border border-white/20 px-6 py-2.5 font-semibold transition duration-200 hover:bg-[#898989]/10 text-${props.color}-500 ${
        props.activeMenu === props.text.toLowerCase()
          ? `bg-${props.color}-500/20`
          : "bg-[#898989]/5"
      }`}
    >
      <Icon src={props.src} className="h-5 w-5 md:h-6 md:w-6" />
      <p className="text-lg">{props.text}</p>
    </button>
  );
}
