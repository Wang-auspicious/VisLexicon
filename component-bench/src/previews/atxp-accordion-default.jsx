import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../vendor/atxp/design-system/src/components/Accordion/Accordion.tsx'
import '../vendor/atxp/design-system/src/styles/globals.css'

// Keep the original Default story's single item, trigger text and body copy.
export default function AtxpAccordionDefault({ p = {} } = {}) {
  return (
    <Accordion type="single" collapsible={p.collapsible ?? true} className="w-[612px]">
      <AccordionItem value="item-1">
        <AccordionTrigger disabled={p.disabled ?? false}>What is a micro-interaction?</AccordionTrigger>
        <AccordionContent>
          Micro-interactions are events which have one main task — a single
          purpose — and they are found all over your device and within apps.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
