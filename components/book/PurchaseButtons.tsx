"use client";

import {
  generateAmazonAffiliateLink,
  generateRakutenAffiliateLink,
} from "@/lib/affiliate";

interface PurchaseButtonsProps {
  isbn?: string | null;
  title: string;
}

export function PurchaseButtons({ isbn, title }: PurchaseButtonsProps) {
  const amazonLink = generateAmazonAffiliateLink(isbn, title);
  const rakutenLink = generateRakutenAffiliateLink(isbn, title);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-800">この本を購入</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Amazon */}
        <a
          href={amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88a00] text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Amazonで購入
        </a>

        {/* 楽天 */}
        <a
          href={rakutenLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#BF0000] hover:bg-[#a00000] text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          楽天で購入
        </a>
      </div>
      <p className="text-xs text-gray-500 text-center">
        ※ 上記リンクからの購入で、当サイトの運営をサポートいただけます
      </p>
    </div>
  );
}
