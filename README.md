## 🗂️ 프로젝트 구조 1

```
messaging-service/
├── app/                    # Next.js 앱 라우트 및 글로벌 스타일
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
├── components/             # 재사용 가능한 React 컴포넌트
│   ├── address-book.tsx    # 주소록(연락처) 컴포넌트
│   ├── dashboard-analytics.tsx
│   ├── dashboard-layout.tsx
│   ├── login-page.tsx
│   ├── messaging-interface.tsx
│   ├── theme-provider.tsx
│   └── ui/                 # 버튼, 카드 등 UI 컴포넌트
├── hooks/                  # 커스텀 React 훅
│   └── use-mobile.ts
├── lib/                    # 유틸리티 함수 및 라이브러리 코드
├── public/                 # 정적 파일(이미지, 폰트 등)
├── styles/                 # 추가 스타일 파일
├── .next/                  # Next.js 빌드 결과물(자동 생성)
├── package.json            # 프로젝트 의존성 및 스크립트
├── tsconfig.json           # TypeScript 설정
├── next.config.mjs         # Next.js 설정
├── postcss.config.mjs      # PostCSS 설정
├── pnpm-lock.yaml          # pnpm 패키지 매니저 lock 파일
├── components.json
├── next-env.d.ts
└── .gitignore
```

---

## 🛠️ 주요 기술 스택 및 버전

- **Next.js**: 최신 버전 (v14+)
- **React**: v18+
- **TypeScript**: v5+
- **pnpm**: 패키지 매니저
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Lucide Icons**: 아이콘 라이브러리
- **Shadcn/ui**: UI 컴포넌트 라이브러리

---

## 📦 주요 폴더 설명

| 폴더/파일         | 설명                                                         |
|-------------------|-------------------------------------------------------------|
| `app/`            | Next.js 라우트, 레이아웃, 글로벌 스타일                      |
| `components/`     | 주소록, 메시징 등 재사용 가능한 UI 컴포넌트                   |
| `components/ui/`  | 버튼, 카드, 입력창 등 기본 UI 컴포넌트                       |
| `hooks/`          | 커스텀 React 훅                                             |
| `lib/`            | 유틸리티 함수, API 클라이언트 등                             |
| `public/`         | 정적 파일 (이미지, 폰트 등)                                  |
| `styles/`         | 추가 CSS 파일                                               |

---

## 🚀 빠른 시작

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 환경 변수 (예시)
`.env.local`에 백엔드 API 주소를 설정하세요.

```bash
# Messaging API
NEXT_PUBLIC_MESSAGING_API_BASE=http://localhost:8080

# Analytics API
NEXT_PUBLIC_ANALYTICS_API_BASE=http://localhost:8080

# Login API
NEXT_PUBLIC_LOGIN_API_BASE=http://localhost:8080

# Phonebook API
NEXT_PUBLIC_PHONEBOOK_API_BASE=http://localhost:8080
```

Docker로 배포 시 컨테이너 포트는 `3000`입니다([ADR-005](../msa-project-hub/docs/adr/ADR-005-service-port-convention.md)).

---

## ✨ 특징

- **주소록 관리**: 연락처 추가, 수정, 삭제, 검색, 정렬 기능
- **모던 UI**: Tailwind CSS, shadcn/ui 기반의 반응형 디자인
- **TypeScript**: 타입 안정성과 생산성 향상
- **Next.js**: 서버 사이드 렌더링 및 파일 기반 라우팅

