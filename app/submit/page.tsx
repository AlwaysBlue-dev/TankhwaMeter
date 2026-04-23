import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit Your Salary",
  description:
    "Anonymously share your salary to help Pakistani professionals know their worth. No account required.",
  openGraph: {
    title: "Submit Your Salary — TankhwaMeter",
    description:
      "Anonymously share your salary to help Pakistani professionals know their worth.",
  },
};

export default function SubmitPage() {
  return <SubmitForm />;
}
