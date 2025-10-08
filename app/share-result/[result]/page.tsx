import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface Props {
  params: {
    result: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Parse result: wpm_correct_incorrect
  const parts = params.result.split('_');
  const wpm = parts[0] || '0';
  const correct = parts[1] || '0';
  const incorrect = parts[2] || '0';

  return {
    title: `I scored ${wpm} WPM on Typing Digital!`,
    description: `I can type ${wpm} words per minute. Are you faster? Test your typing speed and compare the result with your friends.`,
    openGraph: {
      title: `${wpm} WPM - Typing Digital`,
      description: `I can type ${wpm} words per minute. Are you faster? Test your typing speed and compare the result with your friends.`,
      url: 'https://typing.sheakh.digital',
      siteName: 'Typing Digital',
      images: [
        {
          url: 'https://typing.sheakh.digital/og-image.png',
          width: 1200,
          height: 630,
          alt: `Typing Digital - ${wpm} WPM Result`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `I scored ${wpm} WPM on Typing Digital!`,
      description: `I can type ${wpm} words per minute. Are you faster?`,
      images: ['https://typing.sheakh.digital/og-image.png'],
    },
  };
}

export default function ShareResultPage({ params }: Props) {
  // Redirect to home page
  redirect('/');
  return null;
}
