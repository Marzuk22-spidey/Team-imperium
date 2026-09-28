import { Holiday } from '../types';

/**
 * Official academic holidays during the semester (2026-08-29 to 2026-11-29).
 * The calculation engine will skip all classes scheduled on these dates.
 * Additional holidays can be configured by the user in the UI.
 */
export const DEFAULT_HOLIDAYS: Holiday[] = [
  {
    date: '2026-09-04',
    name: 'Milad-un-Nabi',
    description: 'Prophet Muhammad’s Birthday'
  },
  {
    date: '2026-09-14',
    name: 'Vinayagar Chaturthi',
    description: 'Ganesh Chaturthi Festival'
  },
  {
    date: '2026-10-02',
    name: 'Gandhi Jayanti',
    description: 'National Holiday'
  },
  {
    date: '2026-10-19',
    name: 'Ayudha Pooja',
    description: 'Saraswati / Ayudha Pooja'
  },
  {
    date: '2026-10-20',
    name: 'Vijaya Dasami',
    description: 'Dussehra / Vijaya Dasami'
  },
  {
    date: '2026-11-08',
    name: 'Deepavali Eve',
    description: 'Festival Holiday'
  },
  {
    date: '2026-11-09',
    name: 'Deepavali',
    description: 'Diwali Festival'
  }
];
