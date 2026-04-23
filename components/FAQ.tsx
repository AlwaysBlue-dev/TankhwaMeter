import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QUESTIONS = [
  {
    q: "What if someone submits a fake salary?",
    a: "Statistical outliers are automatically flagged by our system. When hundreds of real submissions exist for a role, fake entries don't meaningfully change the average. Patterns across many submissions are extremely difficult to fake consistently.",
  },
  {
    q: "What if my company says these numbers are wrong?",
    a: "Companies have a financial incentive to keep salary information private. Our data comes directly from the people doing the work and receiving the paychecks. When dozens of people report similar salaries for the same role, that pattern is reliable.",
  },
  {
    q: "Is my submission really anonymous?",
    a: "Yes. We collect no name, email, phone number, or any identifying information. We only record your job details and salary. Your IP address is temporarily used only to prevent spam and is never stored permanently.",
  },
  {
    q: "How do I know the data is up to date?",
    a: "Every submission shows when it was added. Use the \"Time Period\" filter on the search page to see only recent data — we recommend filtering to the last 6 months for the most accurate picture of current market rates.",
  },
  {
    q: "Can I submit my salary more than once?",
    a: "You can submit up to 3 times per day. If your salary changes or you change jobs, we encourage you to submit again so our data stays current.",
  },
  {
    q: "Why are some salaries hidden or marked as under review?",
    a: "Submissions that fall outside realistic ranges are automatically flagged for review. This protects data quality. Flagged submissions are not shown publicly until reviewed.",
  },
  {
    q: "Can companies remove their salary data?",
    a: "No. Anonymous crowdsourced data submitted by employees is not owned by companies. Individual submissions can be removed if they violate our guidelines, but aggregate data representing real market rates is always available.",
  },
  {
    q: "How is this different from what Rozee.pk shows?",
    a: "Job boards show salary ranges that employers want to advertise — often lower than what they actually pay to attract negotiation room. Our data comes from employees who received the salary, not employers advertising a role.",
  },
];

export default function FAQ() {
  return (
    <section className="border-t px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about how PK Salary Compass works.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {QUESTIONS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border bg-card px-5 shadow-sm"
            >
              <AccordionTrigger className="py-4 text-left text-sm font-semibold leading-snug hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
