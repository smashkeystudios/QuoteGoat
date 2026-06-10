import dynamic from "next/dynamic";

const BuilderApp = dynamic(() => import("@/components/BuilderApp"), { ssr: false });

export default function BuilderPage() {
  return <BuilderApp />;
}
