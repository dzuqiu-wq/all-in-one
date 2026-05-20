import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}

export const metadata = {
  title: 'All-in-One Toolbox',
};