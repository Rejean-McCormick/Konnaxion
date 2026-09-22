import { redirect } from 'next/navigation';

export default function KonsensusAdminPage(): never {
  redirect('/kontrol/konsensus?sidebar=kontrol');
}
