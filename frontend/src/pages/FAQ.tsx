import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  label: string;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    label: 'About the Calculator',
    items: [
      {
        question: 'What is a carbon footprint?',
        answer:
          "A carbon footprint is the total amount of greenhouse gases — mainly carbon dioxide (CO₂) — that your activities release into the atmosphere each year. It's measured in tonnes of CO₂ equivalent (tCO₂e), which lets us compare different gases on a common scale.",
      },
      {
        question: 'What does tCO₂e/year mean?',
        answer:
          'tCO₂e stands for "tonnes of CO₂ equivalent per year". It\'s a standard unit that combines all greenhouse gases (CO₂, methane, nitrous oxide…) into a single number based on their warming effect. For reference, the global average is about 4.7 tCO₂e per person per year.',
      },
      {
        question: 'What does this calculator measure?',
        answer:
          'This calculator covers four major sources of personal emissions: housing and home energy use (electricity, gas, heating), personal transportation (car, motorbike, public transport), flights, and diet (meat, fish, and dairy consumption). It does not cover shopping, public services, or industrial emissions — so your true footprint may still be higher than what this tool shows.',
      },
      {
        question: 'How accurate are the results?',
        answer:
          'The results are estimates based on widely used emission factors from the EPA, ICAO, and peer-reviewed research. They give you a solid order-of-magnitude picture of your footprint, but exact values will vary depending on your local energy grid, vehicle model, and airline. Use them as a guide, not as a precise measurement.',
      },
    ],
  },
  {
    label: 'Using the App',
    items: [
      {
        question: 'Do I need to fill in all three sections?',
        answer:
          "No. You can fill in just the sections that apply to you. For example, if you don't own a car, simply skip the Transportation section. The calculator will work with whatever information you provide — but you must fill in at least one section to get a result.",
      },
      {
        question: 'What happens if I skip a section?',
        answer:
          "Skipped sections are treated as zero emissions for that category. This means your total will only reflect the sections you completed. The result will still be meaningful — it just won't include emissions from the skipped areas.",
      },
      {
        question: 'Why does the app save my progress automatically?',
        answer:
          'Your form inputs are saved in your browser\'s local storage as you type. This means if you accidentally close the tab or navigate away, your data will still be there when you return. Nothing is sent to any server — it stays on your device. You can clear it at any time using the "Clear" button.',
      },
      {
        question: 'Can I recalculate with different numbers?',
        answer:
          'Yes. On the Results page, click "Recalculate" to go back to the calculator with your previous inputs still loaded. You can adjust any value and calculate again to see how changes affect your footprint.',
      },
    ],
  },
  {
    label: 'Understanding Your Results',
    items: [
      {
        question: "Why is my result lower than my country's average?",
        answer:
          "Country averages represent total per-capita emissions across all sectors of the economy — including industry, agriculture, food production, public services, and more. This calculator only covers housing, transportation, and flights. So even if your lifestyle is average, your result here will naturally be lower than the national figure. The comparison is still useful to see where you stand relative to others.",
      },
      {
        question: 'What does the world average represent?',
        answer:
          'The world average of 4.7 tCO₂e/year is the estimated global per-capita greenhouse gas emission across all sectors. Scientists estimate that to limit global warming to 1.5 °C (the Paris Agreement target), this needs to fall to around 2 tCO₂e per person by 2050.',
      },
      {
        question: 'How are the equivalencies calculated?',
        answer:
          'The three equivalencies use standard factors: trees absorb roughly 22 kg of CO₂ per year on average; an average gasoline car emits about 210 g of CO₂ per km; and a short-haul economy flight of ~1,000 km emits about 255 kg of CO₂ per passenger. We divide your total footprint by each factor to give you a relatable comparison.',
      },
      {
        question: 'What are the personalised tips based on?',
        answer:
          'The tips are selected based on your two highest-emission categories. If housing and flights are your biggest sources, you\'ll see tips specifically for those areas. Some tips are also filtered based on your inputs — for example, if you already fly economy class, the tip to switch from business class won\'t appear.',
      },
    ],
  },
  {
    label: 'Data & Privacy',
    items: [
      {
        question: 'Is my data saved anywhere?',
        answer:
          "No. Your data is never sent to a database or third-party service. The only storage used is your own browser's local storage (to save your draft while filling in the form). When you clear the form or close the browser, the data is gone.",
      },
      {
        question: 'Where do the emission factors come from?',
        answer:
          'The emission factors used in this calculator are based on data from the U.S. Environmental Protection Agency (EPA), the International Civil Aviation Organization (ICAO), the IEA (International Energy Agency), and peer-reviewed scientific literature on forest carbon absorption.',
      },
      {
        question: 'Where does the country average data come from?',
        answer:
          "Country averages are sourced from Our World in Data and the Global Carbon Project, using approximately 2022 data. They represent total per-capita greenhouse gas emissions across all sectors of each country's economy.",
      },
    ],
  },
  {
    label: 'Taking Action',
    items: [
      {
        question: 'My footprint is high — what should I do first?',
        answer:
          "Focus on your highest-impact category first — that's where you can make the biggest difference. If flights dominate your footprint, reducing air travel or choosing economy class has more impact than switching light bulbs. The personalised tips on your Results page are ordered by impact for your specific situation.",
      },
      {
        question: 'What is a "good" carbon footprint target?',
        answer:
          'To align with the Paris Agreement goal of limiting warming to 1.5 °C, global average per-capita emissions need to reach around 2 tCO₂e/year by 2050. Today\'s global average is 4.7 tCO₂e. A realistic near-term personal target for people in high-income countries is 5–6 tCO₂e, working towards 3 tCO₂e by 2030.',
      },
      {
        question: 'Can I offset my emissions?',
        answer:
          'Carbon offsets — purchasing credits that fund projects like reforestation or renewable energy — can help compensate for emissions you cannot yet eliminate. Look for certified programmes such as Gold Standard or Verified Carbon Standard (VCS). Offsets are best used as a complement to reducing emissions, not a substitute.',
      },
    ],
  },
];

export default function FAQ() {
  const [expanded, setExpanded] = useState<string | false>(false);

  function handleChange(panel: string) {
    setExpanded((prev) => (prev === panel ? false : panel));
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Everything you need to know about how this calculator works and what to do with your results.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {FAQ_SECTIONS.map((section) => (
          <Box key={section.label}>
            <Chip
              label={section.label}
              color="primary"
              variant="outlined"
              sx={{ mb: 1.5, fontWeight: 600 }}
            />
            {section.items.map((item, i) => {
              const panel = `${section.label}-${i}`;
              return (
                <Accordion
                  key={panel}
                  expanded={expanded === panel}
                  onChange={() => handleChange(panel)}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:not(:last-child)': { borderBottom: 0 },
                    '&::before': { display: 'none' },
                    '&:first-of-type': { borderRadius: '8px 8px 0 0' },
                    '&:last-of-type': { borderRadius: '0 0 8px 8px' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
