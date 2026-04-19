# financial-ledger

개인용 가계부 웹앱입니다. 연/월/카테고리 기준으로 내역을 보고, 하루 단위로 금액과 메모를 기록하고, 로컬 백업 파일로 데이터를 가져오고 내보낼 수 있습니다.

## 주요 기능

- **Year / Month / Category 드롭다운**으로 원하는 데이터 범위 선택
- **연간 카테고리 그래프**: 선택한 연도의 카테고리별 월 합계를 가로 스크롤 카드 형태로 확인
- **월간 일별 테이블**: 선택한 연/월/카테고리에 대해 해당 월의 모든 날짜를 `Date / Amount / Notes` 컬럼으로 표시
- **Add Record 섹션**: 일자, 금액, 메모만 입력해서 현재 선택한 연/월/카테고리에 단건 기록 추가
- **Import / Export**: 로컬 백업 파일(JSON)로 전체 데이터 가져오기/내보내기
- **브라우저 로컬 저장소 자동 저장**

## 로컬에서 실행하기

### 1. 요구사항

- Node.js 20+
- npm 10+

### 2. 의존성 설치

```bash
cd /home/runner/work/financial-ledger/financial-ledger
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

- <http://localhost:5173>

### 4. 프로덕션 빌드

```bash
npm run build
```

### 5. 린트

```bash
npm run lint
```

## 데이터 저장 / 백업 형식

앱은 브라우저 `localStorage`에 자동 저장하며, 같은 구조를 JSON 백업으로 내보냅니다.

```json
{
  "version": 1,
  "exportedAt": "2026-04-19T18:00:00.000Z",
  "records": [
    ["uuid", "2026-09-29", "Housing", 1200, "Rent"],
    ["uuid", "2026-09-30", "Income", 3500, "Salary"]
  ]
}
```

- `records`는 `[id, date, category, amount, note]` 순서의 배열이라서 백업 파일 크기를 줄이기 쉽습니다.
- `category`는 `Housing`, `Shopping`, `Health`, `Vehicle`, `Subscriptions`, `Entertainment`, `Trip`, `Income` 중 하나입니다.
- `Income` 카테고리는 수입, 나머지는 지출로 간주됩니다.

## 사용 방법

1. 상단에서 **Year / Month / Category**를 선택합니다.
2. **Add record**에서 날짜(day), 금액, 메모를 입력하고 저장합니다.
3. 선택한 연도가 있으면 **Yearly graphs**에서 카테고리별 월 합계를 확인합니다.
4. **Monthly table**에서 해당 월의 일별 합계와 메모를 확인합니다.
5. 필요하면 **Export data / Import data**로 전체 데이터를 백업하거나 복원합니다.
