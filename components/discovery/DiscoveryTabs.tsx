"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FollowingTab } from "./FollowingTab";
import { PopularTab } from "./PopularTab";
import { CategoriesTab } from "./CategoriesTab";
import { SearchTab } from "./SearchTab";
import { RankingsTab } from "./RankingsTab";

type TabType = "following" | "popular" | "categories" | "search" | "rankings";

const tabs = [
  { id: "following" as TabType, label: "フォロー中", icon: "👥" },
  { id: "popular" as TabType, label: "みんなの人気", icon: "🔥" },
  { id: "categories" as TabType, label: "カテゴリ", icon: "📚" },
  { id: "rankings" as TabType, label: "ランキング", icon: "🏆" },
  { id: "search" as TabType, label: "検索", icon: "🔍" },
];

export function DiscoveryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // URLパラメータからタブを取得、なければデフォルト
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam || (session ? "following" : "popular")
  );

  // URLパラメータが変更されたらタブを更新
  useEffect(() => {
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/books?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            // フォロータブはログインユーザーのみ表示
            if (tab.id === "following" && !session) {
              return null;
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div>
        {activeTab === "following" && <FollowingTab />}
        {activeTab === "popular" && <PopularTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "rankings" && <RankingsTab />}
        {activeTab === "search" && <SearchTab />}
      </div>
    </div>
  );
}
