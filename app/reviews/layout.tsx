import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'レビュー一覧 | Books Fan',
  description: 'Books Fanユーザーの書籍レビューを一覧でご覧いただけます。現在この機能は開発中です。',
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
