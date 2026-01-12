import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プレミアムプランにアップグレード | Books Fan',
  description: 'Books Fanのプレミアム会員になって、AI要約機能、高度な読書管理、無制限のレビュー投稿など、充実した機能をご利用ください。月額980円で2週間無料トライアル実施中。',
  keywords: ['プレミアム会員', 'アップグレード', '読書管理', 'AI要約', 'Books Fan'],
  openGraph: {
    title: 'プレミアムプランにアップグレード | Books Fan',
    description: '月額980円で読書体験をアップグレード。AI要約機能や高度な読書管理機能をご利用いただけます。',
    type: 'website',
    url: 'https://books-fan.com/upgrade',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プレミアムプランにアップグレード | Books Fan',
    description: '月額980円で読書体験をアップグレード。AI要約機能や高度な読書管理機能をご利用いただけます。',
  },
};

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
