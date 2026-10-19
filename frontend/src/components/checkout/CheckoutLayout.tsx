import type { PropsWithChildren, ReactNode } from "react";
import { CheckoutHeader } from "./CheckoutHeader";

type CheckoutLayoutProps = PropsWithChildren<{
  activeStep: 2 | 3 | 4;
  aside: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  secureLabel: string;
  orderInProgress?: boolean;
  topBanner?: ReactNode;
}>;

export function CheckoutLayout({ activeStep, aside, children, description, eyebrow, orderInProgress, secureLabel, title, topBanner }: CheckoutLayoutProps) {
  return (
    <div className="checkout-flow-page">
      <CheckoutHeader activeStep={activeStep} orderInProgress={orderInProgress} secureLabel={secureLabel} />
      {topBanner}
      <main className="checkout-flow-main">
        <header className="checkout-page-heading">
          <span>{eyebrow}</span>
          <h1 tabIndex={-1}>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="checkout-flow-grid">
          <div className="checkout-flow-content">{children}</div>
          <aside className="checkout-flow-aside">{aside}</aside>
        </div>
      </main>
    </div>
  );
}

