# Vercel 오류 수정 기록

## 수정된 내용

- `package.json`: TypeScript `^7.0.2` → `5.8.3`, Node.js `22.x` 지정, npm 설치 방식 통일.
- 기존 `bun.lock`: TypeScript 7 등 이전 의존성 설치 구성을 고정하던 파일을 제거. Vercel은 `npm install --include=dev` 사용.
- `vercel.json`: Vite 프레임워크, `dist` 출력, `/api/*` 요청을 `/api/index` 서버리스 함수로 전달하도록 명시.
- `api/index.ts`: Express 앱을 Vercel 함수 진입점으로 직접 내보냄.
- `app.ts`: 누락된 `GEMINI_API_KEY`, API 인증 실패, quota/rate limit, 사용할 수 없는 모델 등을 구별. 모델 fallback을 일시적 오류나 모델 미지원에 한정. 프로덕션 안정형 Gemini 모델로 대체 가능하게 환경변수 제공.
- `src/utils/api.ts`, `src/components`, `src/App.tsx`: API가 HTML 형태의 500 오류를 반환해도 JSON 파싱 오류 대신 상태코드와 문제 메시지 표시.
- `.env.example`, `README.md`: Vercel 환경변수 등록 및 문제 진단 절차 정리.

## 배포 후 확인

1. Vercel Settings → Environment Variables에 `GEMINI_API_KEY`를 **Production** 환경으로 등록했는지 확인. 실제 API 키를 코드나 `.env.example`에 커밋하지 말 것.
2. Vercel에 변경 파일을 push 후 Redeploy (가능하면 캐시를 지우고 배포).
3. `https://YOUR-PROJECT.vercel.app/api/health` 방문. `hasGeminiKey: true`, `status: "ok"`가 표시되어야 함.
4. 실제 생성 요청이 실패하면 브라우저의 오류 메시지와 Vercel Functions 로그를 확인. `health`는 키가 **존재하는지**만 확인하며 키 권한과 quota까지 검증하지는 않음.
5. Vercel의 프로젝트 Root Directory가 `package.json`이 있는 폴더인지 확인.

## 검증 범위

- TypeScript 문법/트랜스파일 정적 확인 통과.
- Express 라우트가 요청을 처리하는 로직을 외부 API와 라이브러리 모킹 환경에서 테스트: 키 누락(503), 정상 생성(200), 모델 대체, 권한 오류(502), API 사용량 제한(429), HTML 오류 응답 파싱.
- 이 실행 환경은 npm registry 네트워크 접근이 차단되어 실제 `npm install` + `vite build`는 수행하지 못함. 따라서 **실제 Vercel 빌드 및 Gemini 호출 성공은 배포 후 확인 필요**.
