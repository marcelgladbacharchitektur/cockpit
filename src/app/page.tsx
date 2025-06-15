import { redirect } from 'next/navigation';

export default function Home() {
  // Leite den Benutzer sofort und serverseitig zum Cockpit-Dashboard weiter.
  redirect('/cockpit');

  // Da die Weiterleitung sofort erfolgt, wird dieser Teil nie gerendert.
  // Wir können ihn leer lassen oder eine Fallback-Nachricht einfügen.
  return null;
}