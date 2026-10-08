import type { Metadata } from "next";
import { ThankYou } from "@/components/ThankYou";

export const metadata: Metadata = {
  title: "DAELY · ¡Gracias!",
};

export default function GraciasPage() {
  return <ThankYou />;
}
