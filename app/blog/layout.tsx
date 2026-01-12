import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Books Fanブログ | 読書術・学習法・おすすめ本の情報',
  description: '読書術、効率的な学習法、おすすめの本、読書管理のヒントなど、本にまつわる様々な情報をお届けします。Books Fanの最新記事をチェックして、あなたの読書体験をさらに豊かにしましょう。',
  keywords: ['読書ブログ', '読書術', '学習法', 'おすすめ本', '読書管理', 'Books Fan'],
  openGraph: {
    title: 'Books Fanブログ | 読書術・学習法・おすすめ本の情報',
    description: '読書術、学習法、おすすめの本など、本にまつわる情報をお届けします。',
    type: 'website',
    url: 'https://books-fan.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Books Fanブログ | 読書術・学習法・おすすめ本の情報',
    description: '読書術、学習法、おすすめの本など、本にまつわる情報をお届けします。',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
