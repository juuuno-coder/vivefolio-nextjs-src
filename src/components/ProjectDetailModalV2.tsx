"use client";

import React from "react";
import { ProjectDetailModal } from "./ProjectDetailModal";

interface ProjectDetailModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    urls: { full: string; regular: string };
    user: {
      username: string;
      profile_image: { small: string; large: string };
    };
    likes: number;
    views?: number;
    description: string | null;
    alt_description: string | null;
    created_at: string;
    width: number;
    height: number;
    userId?: string;
  } | null;
}

export function ProjectDetailModalV2(props: ProjectDetailModalV2Props) {
  // 임시로 기존 모달 사용
  return <ProjectDetailModal {...props} />;
}
