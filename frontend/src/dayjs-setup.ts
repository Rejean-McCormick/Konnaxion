import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// Ajoute d'autres plugins si besoin: advancedFormat, isBetween, etc.

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Définis la locale si voulu:
// import 'dayjs/locale/fr';
// dayjs.locale('fr');
