import { Metadata } from "next";
import ClientPage from "../components/ClientPage";

export const metadata: Metadata = {
  title: "VibeShip - AI Startup Generator",
  description: "Generate viral AI startup ideas with one click",
};

export default function Page() {
  return <ClientPage />;
}
