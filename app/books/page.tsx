"use client";

import { DiscoveryTabs } from "@/components/discovery/DiscoveryTabs";
import { RecommendationsSidebar } from "@/components/discovery/RecommendationsSidebar";
import { Suspense } from "react";

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">本を探す</h1>
          <p className="text-gray-600 text-lg">
            さまざまな方法で、あなたにぴったりの本を見つけましょう
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Discovery Tabs */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<div>読み込み中...</div>}>
              <DiscoveryTabs />
            </Suspense>
          </div>

          {/* Recommendations Sidebar */}
          <RecommendationsSidebar />
        </div>
      </div>
    </div>
  );
}
