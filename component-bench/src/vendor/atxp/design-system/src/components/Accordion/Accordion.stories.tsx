import type { Meta } from '@storybook/react-vite';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';

/**
 * A vertically stacked set of interactive headings that each reveal a section of content.
 *
 * Based on the Figma design:
 * https://www.figma.com/design/nadcKNlrnZUHbbLwm9GdK4?node-id=2672-1548
 */
const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nadcKNlrnZUHbbLwm9GdK4/C-C-Design-System---Components?node-id=2672-1548&m=dev',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;

export const Default = {
  render: () => (
    <Accordion type="single" collapsible className="w-[612px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is a micro-interaction?</AccordionTrigger>
        <AccordionContent>
          Micro-interactions are events which have one main task — a single
          purpose — and they are found all over your device and within apps.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple = {
  render: () => (
    <Accordion type="single" collapsible className="w-[612px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is a micro-interaction?</AccordionTrigger>
        <AccordionContent>
          Micro-interactions are events which have one main task — a single
          purpose — and they are found all over your device and within apps.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What is a micro-interaction?</AccordionTrigger>
        <AccordionContent>
          Micro-interactions are events which have one main task — a single
          purpose — and they are found all over your device and within apps.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What is a micro-interaction?</AccordionTrigger>
        <AccordionContent>
          Micro-interactions are events which have one main task — a single
          purpose — and they are found all over your device and within apps.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleOpen = {
  render: () => (
    <Accordion type="multiple" className="w-[612px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern and uses semantic HTML.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the Figma design system.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default with smooth expand/collapse transitions.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
