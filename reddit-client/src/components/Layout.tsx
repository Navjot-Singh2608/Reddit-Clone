import React from "react";
import { Navbar } from "./Navbar";
import { Wrapper, WrapperVariant } from "./wrapper";

interface LayoutProps {
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <div>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </div>
  );
};
