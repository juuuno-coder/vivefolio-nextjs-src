# Vibefolio API 가이드

이 문서는 Supabase 데이터베이스와 연동된 API 사용 방법을 설명합니다.

## 📋 목차

1. [인증 API](#인증-api)
2. [프로젝트 API](#프로젝트-api)
3. [좋아요 API](#좋아요-api)
4. [댓글 API](#댓글-api)

---

## 🔐 인증 API

### 회원가입

```typescript
POST /api/auth/signup

// Request Body
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "사용자닉네임" // 선택사항
}

// Response (201)
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "nickname": "사용자닉네임",
    "profile_image_url": null,
    "created_at": "2025-12-10T00:00:00Z",
    "role": "user"
  }
}
```

### 로그인

```typescript
POST /api/auth/login

// Request Body
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200)
{
  "message": "로그인 성공",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "nickname": "사용자닉네임",
    "profile_image_url": null,
    "role": "user"
  }
}
```

---

## 📁 프로젝트 API

### 프로젝트 목록 조회

```typescript
GET /api/projects
GET /api/projects?category=AI
GET /api/projects?userId=1
GET /api/projects?limit=10

// Response (200)
{
  "projects": [
    {
      "project_id": 1,
      "user_id": 1,
      "category_id": 2,
      "title": "프로젝트 제목",
      "content_text": "프로젝트 설명",
      "thumbnail_url": "https://...",
      "views": 100,
      "created_at": "2025-12-10T00:00:00Z",
      "User": {
        "user_id": 1,
        "nickname": "사용자닉네임",
        "profile_image_url": null
      },
      "Category": {
        "category_id": 2,
        "name": "AI"
      }
    }
  ]
}
```

### 프로젝트 생성

```typescript
POST /api/projects

// Request Body
{
  "user_id": 1,
  "category_id": 2,
  "title": "새 프로젝트",
  "content_text": "프로젝트 설명",
  "thumbnail_url": "https://...",
  "rendering_type": "image", // 선택사항
  "custom_data": "{}" // 선택사항
}

// Response (201)
{
  "project": { /* 프로젝트 객체 */ }
}
```

### 개별 프로젝트 조회

```typescript
GET /api/projects/[id]

// Response (200)
{
  "project": {
    "project_id": 1,
    "title": "프로젝트 제목",
    // ... 프로젝트 정보
  }
}
```

### 프로젝트 수정

```typescript
PUT /api/projects/[id]

// Request Body
{
  "title": "수정된 제목",
  "content_text": "수정된 설명",
  "category_id": 3
}

// Response (200)
{
  "project": { /* 수정된 프로젝트 */ }
}
```

### 프로젝트 삭제

```typescript
DELETE /api/projects/[id]

// Response (200)
{
  "message": "프로젝트가 삭제되었습니다."
}
```

---

## ❤️ 좋아요 API

### 좋아요 토글 (추가/제거)

```typescript
POST /api/likes

// Request Body
{
  "user_id": 1,
  "project_id": 1
}

// Response (200) - 좋아요 추가
{
  "liked": true,
  "message": "좋아요를 추가했습니다."
}

// Response (200) - 좋아요 제거
{
  "liked": false,
  "message": "좋아요가 취소되었습니다."
}
```

### 좋아요 여부 확인

```typescript
GET /api/likes?userId=1&projectId=1

// Response (200)
{
  "liked": true
}
```

### 사용자의 좋아요 목록

```typescript
GET /api/likes?userId=1

// Response (200)
{
  "likes": [
    {
      "user_id": 1,
      "project_id": 1,
      "created_at": "2025-12-10T00:00:00Z",
      "Project": { /* 프로젝트 정보 */ }
    }
  ]
}
```

### 프로젝트의 좋아요 수

```typescript
GET /api/likes?projectId=1

// Response (200)
{
  "count": 42
}
```

---

## 💬 댓글 API

### 댓글 목록 조회

```typescript
GET /api/comments?projectId=1

// Response (200)
{
  "comments": [
    {
      "comment_id": 1,
      "user_id": 1,
      "project_id": 1,
      "content": "댓글 내용",
      "parent_comment_id": null,
      "created_at": "2025-12-10T00:00:00Z",
      "User": {
        "user_id": 1,
        "nickname": "사용자닉네임",
        "profile_image_url": null
      }
    }
  ]
}
```

### 댓글 작성

```typescript
POST /api/comments

// Request Body
{
  "user_id": 1,
  "project_id": 1,
  "content": "댓글 내용",
  "parent_comment_id": null // 대댓글인 경우 부모 댓글 ID
}

// Response (201)
{
  "comment": { /* 댓글 객체 */ }
}
```

### 댓글 삭제

```typescript
DELETE /api/comments?commentId=1

// Response (200)
{
  "message": "댓글이 삭제되었습니다."
}
```

---

## 🔧 사용 예제

### React 컴포넌트에서 사용

```typescript
// 프로젝트 목록 조회
const fetchProjects = async () => {
  const response = await fetch("/api/projects");
  const data = await response.json();
  return data.projects;
};

// 좋아요 토글
const toggleLike = async (userId: number, projectId: number) => {
  const response = await fetch("/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, project_id: projectId }),
  });
  return await response.json();
};

// 댓글 작성
const createComment = async (
  userId: number,
  projectId: number,
  content: string
) => {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, project_id: projectId, content }),
  });
  return await response.json();
};
```

---

## 📝 참고사항

1. **인증**: 현재는 간단한 이메일/비밀번호 인증을 사용합니다. 추후 JWT 토큰 기반 인증으로 업그레이드할 수 있습니다.

2. **에러 처리**: 모든 API는 에러 발생 시 다음 형식으로 응답합니다:

   ```json
   {
     "error": "에러 메시지"
   }
   ```

3. **페이지네이션**: 현재는 limit 파라미터만 지원합니다. 추후 offset 기반 페이지네이션을 추가할 수 있습니다.

4. **파일 업로드**: 이미지 업로드는 Supabase Storage를 사용하는 것을 권장합니다.
