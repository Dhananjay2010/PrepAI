"use client";

import { motion } from "framer-motion";

export function SkeletonHeader() {
  return (
    <div className="bg-paper-raised border-b border-slate/10 py-4 px-6 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-24 bg-slate/10 rounded animate-pulse" />
          <div className="h-4 w-10 bg-slate/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-20 bg-slate/10 rounded-full animate-pulse" />
          <div className="h-8 w-24 bg-slate/10 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start py-6">
        <div className="space-y-6">
          <div className="h-4 w-32 bg-slate/10 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-slate/15 rounded-lg animate-pulse" />
          <div className="h-6 w-5/6 bg-slate/10 rounded animate-pulse" />
          <div className="h-32 w-full bg-slate/10 rounded-2xl animate-pulse" />
        </div>
        <div className="h-96 w-full bg-slate/10 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center border-b border-slate/10 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate/15 rounded-md animate-pulse" />
          <div className="h-4 w-48 bg-slate/10 rounded animate-pulse" />
        </div>
        <div className="flex space-x-3">
          <div className="h-10 w-36 bg-slate/15 rounded-md animate-pulse" />
          <div className="h-10 w-24 bg-slate/10 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 bg-slate/10 rounded-xl animate-pulse" />
        <div className="h-40 bg-slate/10 rounded-xl animate-pulse" />
      </div>

      {/* Sessions History Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate/15 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonSessionDetail() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-300">
      <div className="h-4 w-32 bg-slate/10 rounded animate-pulse" />

      {/* Role Banner Skeleton */}
      <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 space-y-4">
        <div className="h-6 w-28 bg-slate/15 rounded animate-pulse" />
        <div className="h-8 w-3/4 bg-slate/20 rounded-md animate-pulse" />
        <div className="h-4 w-full bg-slate/10 rounded animate-pulse" />
      </div>

      {/* Question Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate/15 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-paper-raised rounded-xl p-6 border border-slate/10 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate/15 rounded animate-pulse" />
              <div className="h-4 w-12 bg-slate/10 rounded animate-pulse" />
            </div>
            <div className="h-6 w-5/6 bg-slate/20 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-slate/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPreciseAnswer() {
  return (
    <div className="bg-paper-raised p-5 rounded-xl border border-mint/20 space-y-3 animate-pulse">
      <div className="flex justify-between items-center pb-2 border-b border-mint/10">
        <div className="h-4 w-48 bg-mint/20 rounded" />
        <div className="h-3 w-16 bg-mint/20 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-28 bg-slate/20 rounded" />
        <div className="h-4 w-full bg-slate/15 rounded" />
      </div>
      <div className="space-y-1.5 pt-2">
        <div className="h-3 w-32 bg-slate/20 rounded" />
        <div className="h-3 w-5/6 bg-slate/10 rounded" />
        <div className="h-3 w-4/6 bg-slate/10 rounded" />
      </div>
      <div className="h-16 w-full bg-focus/10 rounded-lg pt-2" />
    </div>
  );
}
