# AI기반 바이브코딩(Vibe Coding) 웹개발 학습 템플릿

이 프로젝트는 대규모 언어 모델(LLM)을 활용하여 개발 프로세스를 지원하면서 음악 앱을 만드는 데 초점을 맞춘 AI 기반 바이브코딩(Vibe Coding) 기반 웹개발 학습 템플릿입니다.

## 프로젝트 개요

이 템플릿은 Svelte를 사용하여 웹 애플리케이션을 구축하기 위한 최소한의 출발점을 제공하며, AI 기반 바이브코딩 개발 기술 학습에 중점을 두고 있습니다. 프로젝트 구조는 AI의 지원을 받으며 풀스택 개발로 나아가는 단계별 접근 방식을 강조하고, 음악 앱의 주요 기능 설계 및 구현 프로세스를 안내합니다.

## 시작하기

1. 이 리포지토리를 클론합니다.
2. 의존성을 설치합니다：
   ```bash
   npm install
   ```
3. 개발 서버를 시작합니다：
   ```bash
   npm run dev
   ```

## 프로젝트 구조
- `.cursor/rules/`: 개발 프로세스의 각 단계에 대한 가이드 문서를 포함
- `prisma/`: 데이터베이스 스키마 파일을 포함
- `src/`: 애플리케이션의 소스 코드를 포함
- `lib/components/`: ArtistCard와 SongCard의 스켈레톤 컴포넌트
- `routes/api/`: 아티스트와 곡의 스켈레톤 API 경로
- 설정 파일: package.json, tsconfig.json, svelte.config.js, vite.config.ts

## 학습 프로세스

음악 앱을 구축하면서 AI 기반 개발 기술을 학습하기 위해, 다음 단계를 따르세요：

1. 데이터베이스 설계: `.cursor/rules/database_design_guide.mdc`에 따르기
2. 프론트엔드 컴포넌트 구축: `.cursor/rules/frontend_component_guide.mdc`에 따르기
3. 백엔드구현: `.cursor/rules/backend_implementation_guide.mdc`에 따르기
4. 프론트엔드/백엔드 통합: `.cursor/rules/integration_guide.mdc`에 따르기
5. 기능추가 구현: `.cursor/rules/feature_addition_guide.mdc`에 따르기

각 가이드는 개발 과정에서 AI 지원을 활용하는 방법에 대한 자세한 지침을 제공합니다.

## AI기반 개발팁
- AI를 사용하여 코드 스니펫을 생성하지만 항상 생성된 코드를 확인하고 이해합니다.
- 복잡한 개념과 모범 사례에 대해 AI에 설명을 요청하십시오.
- 문제 해결에 AI를 활용하지만 제안된 솔루션을 비판적으로 평가하십시오.
- 코드 리팩토링 및 최적화 제안에 AI를 활용하십시오.
- 테스트 전략 및 테스트 사례의 예에 대해 AI에 문의하십시오.

## 학습 목표

이 프로젝트를 완료함으로써 다음과 같은 경험을 얻을 수 있습니다：
- 웹 개발의 다양한 측면에서 LLM을 사용하기
- Svelte와 SvelteKit을 사용하여 풀스택 웹 애플리케이션을 구현하기
- RESTful API를 개발하고 테스트하기
- Prisma ORM을 사용하여 데이터베이스를 조작하기
- 웹 애플리케이션의 테스트를 작성하고 실행하기
- 프론트엔드와 백엔드의 컴포넌트를 통합하기
- Web 오디오 플레이어의 고급 기능을 구현하기
- AI 생성의 코드와 제안을 비판적으로 평가하기

AI가 생성한 모든 제안을 비판적으로 평가하고, 구현에 관한 최종적인 결정을 내릴 때는 자신의 판단을 사용하는 것을 잊지 마십시오.

## 추가 리소스
- [SvelteKit 문서](https://kit.svelte.dev/docs)
- [Prisma 문서](https://www.prisma.io/docs/)

# Copyright (c) 2025 Jaewoo Kim
# MIT License - https://opensource.org/licenses/MIT
