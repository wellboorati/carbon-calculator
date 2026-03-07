import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Add questions and answers here when content is ready
const FAQ_ITEMS: { question: string; answer: string }[] = [];

export default function FAQ() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find answers to common questions about the Carbon Calculator.
      </Typography>

      {FAQ_ITEMS.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          FAQ content coming soon.
        </Typography>
      ) : (
        FAQ_ITEMS.map((item, i) => (
          <Accordion key={i} sx={{ borderRadius: 2, mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}
