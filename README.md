# financial-ledger

개인용 가계부 React 웹앱입니다. (로컬 저장/불러오기 포함)

## 주요 기능

- 일/월/년 기준 수입/지출 합계 및 잔액 표시
- 요청한 카테고리 + 세부 카테고리로 기록
- 지출/수입 항목마다 설명(메모) 저장
- 월별/연도별 카테고리 그래프(막대 차트)
- 월 예산(Budget) 설정 + 사용량 추적
- 과거 기록 + 미래 플랜(월별 계획 수입/지출/메모)
- 로컬 저장소(localStorage) 자동 저장
- JSON 내보내기/가져오기(백업/복원)

## 로컬 실행 방법

### 1) 요구사항

- Node.js 20+ 권장
- npm 10+ 권장

### 2) 설치

```bash
cd /home/runner/work/financial-ledger/financial-ledger
npm install
```

### 3) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 보통 아래 주소로 접속합니다.

- <http://localhost:5173>

### 4) 프로덕션 빌드

```bash
npm run build
```

### 5) 린트

```bash
npm run lint
```

## 사용 방법

1. **Add Entry**에서 날짜/수입·지출/카테고리/금액/설명을 입력하고 저장
2. **Month view / Year view**를 바꿔 월간·연간 결과 확인
3. **Monthly budget**을 설정해 현재 월 지출 대비 예산 사용량 확인
4. **Plan (Past + Future)**에서 월별 계획 수입·지출·메모 저장
5. 상단의 **Export JSON / Import JSON**으로 데이터 백업·복원

## 데이터 저장 방식

- 기본 저장: 브라우저 `localStorage` (키: `financial-ledger-data-v1`)
- 백업 파일: JSON 파일로 내보내기/가져오기 지원
- 서버 없이 로컬 기기에서 데이터 유지 가능
