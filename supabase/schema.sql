-- Vibefolio Database Schema for Supabase
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. User 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "User" (
    user_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    role VARCHAR(50) NOT NULL DEFAULT 'user'
);

-- ============================================
-- 2. Category 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Category" (
    category_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES "Category"(category_id) ON DELETE SET NULL
);

-- ============================================
-- 3. Project 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Project" (
    project_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    rendering_type VARCHAR(50),
    custom_data TEXT,
    thumbnail_url VARCHAR(500),
    content_text TEXT,
    views INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES "Category"(category_id) ON DELETE RESTRICT
);

-- ============================================
-- 4. Like 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Like" (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES "Project"(project_id) ON DELETE CASCADE
);

-- ============================================
-- 5. Wishlist 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Wishlist" (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES "Project"(project_id) ON DELETE CASCADE
);

-- ============================================
-- 6. Comment 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Comment" (
    comment_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES "Project"(project_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES "Comment"(comment_id) ON DELETE CASCADE
);

-- ============================================
-- 7. Proposal 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "Proposal" (
    proposal_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- ============================================
-- 8. OutsourcingRequest 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "OutsourcingRequest" (
    request_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    budget VARCHAR(100),
    required_duration VARCHAR(100),
    required_skills VARCHAR(500),
    details TEXT,
    is_complete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category_id INT,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES "Category"(category_id) ON DELETE SET NULL
);

-- ============================================
-- 9. JobPosting 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS "JobPosting" (
    posting_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    company_name VARCHAR(255),
    location VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    job_type VARCHAR(100),
    required_skills TEXT,
    description TEXT,
    deadline DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category_id INT,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES "Category"(category_id) ON DELETE SET NULL
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================

-- User 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_is_active ON "User"(is_active);

-- Project 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_project_user_id ON "Project"(user_id);
CREATE INDEX IF NOT EXISTS idx_project_category_id ON "Project"(category_id);
CREATE INDEX IF NOT EXISTS idx_project_created_at ON "Project"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_views ON "Project"(views DESC);

-- Like 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_like_project_id ON "Like"(project_id);

-- Wishlist 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_wishlist_project_id ON "Wishlist"(project_id);

-- Comment 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_comment_project_id ON "Comment"(project_id);
CREATE INDEX IF NOT EXISTS idx_comment_user_id ON "Comment"(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_parent_id ON "Comment"(parent_comment_id);

-- JobPosting 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_jobposting_status ON "JobPosting"(status);
CREATE INDEX IF NOT EXISTS idx_jobposting_deadline ON "JobPosting"(deadline);

-- OutsourcingRequest 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_outsourcing_is_complete ON "OutsourcingRequest"(is_complete);

-- ============================================
-- 트리거 함수: updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User 테이블 트리거
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Project 테이블 트리거
CREATE TRIGGER update_project_updated_at
    BEFORE UPDATE ON "Project"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment 테이블 트리거
CREATE TRIGGER update_comment_updated_at
    BEFORE UPDATE ON "Comment"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Proposal 테이블 트리거
CREATE TRIGGER update_proposal_updated_at
    BEFORE UPDATE ON "Proposal"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- JobPosting 테이블 트리거
CREATE TRIGGER update_jobposting_updated_at
    BEFORE UPDATE ON "JobPosting"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 기본 카테고리 데이터 삽입
-- ============================================
INSERT INTO "Category" (name, parent_id) VALUES
    ('전체', NULL),
    ('AI', NULL),
    ('영상/모션그래픽', NULL),
    ('그래픽 디자인', NULL),
    ('웹 디자인', NULL),
    ('일러스트', NULL),
    ('3D', NULL),
    ('사진', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Row Level Security (RLS) 설정
-- ============================================

-- User 테이블 RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
    ON "User" FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON "User" FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- Project 테이블 RLS
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
    ON "Project" FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own projects"
    ON "Project" FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own projects"
    ON "Project" FOR UPDATE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own projects"
    ON "Project" FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- Like 테이블 RLS
ALTER TABLE "Like" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
    ON "Like" FOR SELECT
    USING (true);

CREATE POLICY "Users can manage own likes"
    ON "Like" FOR ALL
    USING (auth.uid()::text = user_id::text);

-- Comment 테이블 RLS
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
    ON "Comment" FOR SELECT
    USING (is_deleted = false);

CREATE POLICY "Users can insert own comments"
    ON "Comment" FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own comments"
    ON "Comment" FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- ============================================
-- 완료 메시지
-- ============================================
-- 스키마 생성이 완료되었습니다!
-- Supabase Dashboard > SQL Editor에서 이 스크립트를 실행하세요.
