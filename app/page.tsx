"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

type View = "home" | "games" | "report" | "watch";
type GameId = "matching" | "reverse" | "word";
type Area = "기억력" | "작업 기억" | "언어감각" | "집중력" | "공간지각";

type PlayRecord = {
  game: string;
  area: Area;
  score: number;
  accuracy: number;
  reaction: number;
  day: string;
};

const games: Array<{
  id: GameId;
  title: string;
  area: Area;
  time: string;
  description: string;
  best: number;
  level: string;
}> = [
  {
    id: "matching",
    title: "짝 찾기",
    area: "기억력",
    time: "3분",
    description: "카드를 뒤집어 같은 그림의 위치를 기억합니다.",
    best: 92,
    level: "보통",
  },
  {
    id: "reverse",
    title: "숫자 역주행",
    area: "작업 기억",
    time: "2분",
    description: "순간적으로 본 숫자를 거꾸로 떠올립니다.",
    best: 86,
    level: "쉬움",
  },
  {
    id: "word",
    title: "단어 사냥",
    area: "언어감각",
    time: "1분",
    description: "제시어와 어울리는 단어를 빠르게 적어봅니다.",
    best: 78,
    level: "쉬움",
  },
];

const starterRecords: PlayRecord[] = [
  {
    game: "짝 찾기",
    area: "기억력",
    score: 92,
    accuracy: 96,
    reaction: 1.8,
    day: "월",
  },
  {
    game: "색깔 거짓말",
    area: "집중력",
    score: 74,
    accuracy: 82,
    reaction: 2.4,
    day: "화",
  },
  {
    game: "숫자 역주행",
    area: "작업 기억",
    score: 86,
    accuracy: 88,
    reaction: 2.1,
    day: "수",
  },
  {
    game: "단어 사냥",
    area: "언어감각",
    score: 78,
    accuracy: 84,
    reaction: 2.0,
    day: "목",
  },
  {
    game: "길 기억하기",
    area: "공간지각",
    score: 81,
    accuracy: 86,
    reaction: 2.2,
    day: "금",
  },
];

const memorySymbols = ["해", "달", "별", "꽃"];

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [activeGame, setActiveGame] = useState<GameId>("matching");
  const [records, setRecords] = useState<PlayRecord[]>(starterRecords);
  const [points, setPoints] = useState(740);
  const [todayPlays, setTodayPlays] = useState(1);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [analysisOn, setAnalysisOn] = useState(false);
  const [watchOn, setWatchOn] = useState(true);
  const [leisureNow, setLeisureNow] = useState(true);
  const [dailyAlerts, setDailyAlerts] = useState(2);
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");

  const level = Math.min(20, Math.floor(points / 180) + 1);
  const levelProgress = points % 180;
  const weeklyAverage = Math.round(
    records.reduce((sum, record) => sum + record.score, 0) / records.length,
  );
  const strongestArea = useMemo(() => {
    const totals = records.reduce(
      (acc, record) => {
        acc[record.area] = acc[record.area] ?? { score: 0, count: 0 };
        acc[record.area].score += record.score;
        acc[record.area].count += 1;
        return acc;
      },
      {} as Record<Area, { score: number; count: number }>,
    );

    return Object.entries(totals).sort(
      (a, b) => b[1].score / b[1].count - a[1].score / a[1].count,
    )[0]?.[0] as Area;
  }, [records]);
  const needsPrecisionCheck =
    records.filter((record) => record.score < 76).length >= 2 ||
    weeklyAverage < 80;

  function completeGame(gameId: GameId, score: number, accuracy: number) {
    const game = games.find((item) => item.id === gameId)!;
    const basePoints = 5;
    const firstPlayBonus = todayPlays === 0 ? 10 : 0;
    const missionBonus = todayPlays + 1 === 3 ? 30 : 0;

    setPoints((current) => current + basePoints + firstPlayBonus + missionBonus);
    setTodayPlays((current) => current + 1);
    setRecords((current) => [
      ...current.slice(-5),
      {
        game: game.title,
        area: game.area,
        score,
        accuracy,
        reaction: Number((1.4 + (100 - score) / 45).toFixed(1)),
        day: "오늘",
      },
    ]);
    setView("report");
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#22211d]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-[#ded8c8] bg-[#fffdf8] px-5 py-5 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5e7d68]">
                MindPick
              </p>
              <h1 className="mt-2 text-2xl font-black">마인드픽</h1>
            </div>
            <div className="rounded-lg bg-[#243b2f] px-3 py-2 text-right text-white lg:mt-6">
              <p className="text-xs text-[#cde5d5]">보유 포인트</p>
              <p className="text-xl font-black">{points.toLocaleString()}P</p>
            </div>
          </div>

          <nav className="mt-5 grid grid-cols-4 gap-2 lg:grid-cols-1">
            <NavButton active={view === "home"} label="홈" onClick={() => setView("home")} />
            <NavButton
              active={view === "games"}
              label="게임"
              onClick={() => setView("games")}
            />
            <NavButton
              active={view === "report"}
              label="리포트"
              onClick={() => setView("report")}
            />
            <NavButton
              active={view === "watch"}
              label="워치"
              onClick={() => setView("watch")}
            />
          </nav>

          <section className="mt-5 rounded-lg border border-[#ded8c8] bg-[#faf3df] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Lv.{level} 기억 산책가</p>
              <p className="text-xs text-[#6d6658]">{levelProgress}/180</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#e3dac7]">
              <div
                className="h-2 rounded-full bg-[#e56f4f]"
                style={{ width: `${Math.min(100, (levelProgress / 180) * 100)}%` }}
              />
            </div>
          </section>
        </aside>

        <div className="flex-1">
          <header className="border-b border-[#ded8c8] bg-[#fffdf8] px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-[#5e7d68]">
                  하루 5분 두뇌 트레이닝
                </p>
                <h2 className="mt-1 text-2xl font-black md:text-3xl">
                  {viewTitle(view)}
                </h2>
              </div>
              <div className="flex gap-2">
                <StatusPill label="오늘 플레이" value={`${todayPlays}/3`} />
                <StatusPill label="주간 평균" value={`${weeklyAverage}점`} />
              </div>
            </div>
          </header>

          {view === "home" && (
            <HomeView
              analysisOn={analysisOn}
              dailyAlerts={dailyAlerts}
              leisureNow={leisureNow}
              needsPrecisionCheck={needsPrecisionCheck}
              onboardingStep={onboardingStep}
              setActiveGame={setActiveGame}
              setAnalysisOn={setAnalysisOn}
              setOnboardingStep={setOnboardingStep}
              setView={setView}
              strongestArea={strongestArea}
              watchOn={watchOn}
              weeklyAverage={weeklyAverage}
            />
          )}

          {view === "games" && (
            <GamesView
              activeGame={activeGame}
              completeGame={completeGame}
              setActiveGame={setActiveGame}
            />
          )}

          {view === "report" && (
            <ReportView
              analysisOn={analysisOn}
              needsPrecisionCheck={needsPrecisionCheck}
              records={records}
              setAnalysisOn={setAnalysisOn}
              setView={setView}
              strongestArea={strongestArea}
              weeklyAverage={weeklyAverage}
            />
          )}

          {view === "watch" && (
            <WatchView
              dailyAlerts={dailyAlerts}
              leisureNow={leisureNow}
              setDailyAlerts={setDailyAlerts}
              setLeisureNow={setLeisureNow}
              setWatchOn={setWatchOn}
              setWorkEnd={setWorkEnd}
              setWorkStart={setWorkStart}
              watchOn={watchOn}
              workEnd={workEnd}
              workStart={workStart}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function HomeView({
  analysisOn,
  dailyAlerts,
  leisureNow,
  needsPrecisionCheck,
  onboardingStep,
  setActiveGame,
  setAnalysisOn,
  setOnboardingStep,
  setView,
  strongestArea,
  watchOn,
  weeklyAverage,
}: {
  analysisOn: boolean;
  dailyAlerts: number;
  leisureNow: boolean;
  needsPrecisionCheck: boolean;
  onboardingStep: number;
  setActiveGame: (game: GameId) => void;
  setAnalysisOn: (value: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setView: (view: View) => void;
  strongestArea: Area;
  watchOn: boolean;
  weeklyAverage: number;
}) {
  return (
    <div className="space-y-5 px-5 py-5">
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                {watchOn && leisureNow && (
                  <span className="rounded-lg bg-[#d7f0df] px-3 py-1 text-sm font-bold text-[#1d5c39]">
                    지금 딱 좋은 타이밍
                  </span>
                )}
                <span className="rounded-lg bg-[#ffe4d8] px-3 py-1 text-sm font-bold text-[#9a3e28]">
                  오늘의 추천
                </span>
              </div>
              <h3 className="mt-4 text-3xl font-black">짝 찾기 한 판</h3>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#625d52]">
                카드 위치를 기억하며 단기 기억력을 가볍게 깨워요. 완료하면
                기본 5포인트가 적립됩니다.
              </p>
            </div>
            <button
              className="h-12 rounded-lg bg-[#243b2f] px-5 text-sm font-black text-white transition hover:bg-[#1a2c22]"
              onClick={() => {
                setActiveGame("matching");
                setView("games");
              }}
            >
              플레이
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffbec] p-5">
          <p className="text-sm font-bold text-[#766a43]">워치 감지 상태</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Metric label="심박" value="72" unit="bpm" />
            <Metric label="비활동" value="34" unit="분" />
            <Metric label="알림" value={String(dailyAlerts)} unit="회" />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#625d52]">
            안정 심박, 비활동, 업무 시간 제외 조건이 맞아 추천 배지가 켜진
            상태입니다.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardTile
          label="이번 주 두뇌 활동"
          value={`${weeklyAverage}점`}
          detail={`가장 강한 영역은 ${strongestArea}입니다.`}
          tone="green"
        />
        <DashboardTile
          label="오늘 적립"
          value="15P"
          detail="일일 첫 게임과 완료 보상이 반영됐습니다."
          tone="coral"
        />
        <DashboardTile
          label="정밀 모드"
          value={needsPrecisionCheck ? "권유 가능" : "대기"}
          detail={
            needsPrecisionCheck
              ? "성적표에서 테스트 진입을 열 수 있어요."
              : "꾸준히 플레이하면 더 정확해집니다."
          }
          tone="yellow"
        />
      </section>

      <section className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5e7d68]">온보딩 고지 단계</p>
            <h3 className="mt-1 text-xl font-black">{onboardingTitle(onboardingStep)}</h3>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                className={`h-10 w-10 rounded-lg text-sm font-black ${
                  onboardingStep === step
                    ? "bg-[#243b2f] text-white"
                    : "border border-[#d8d1bf] bg-white text-[#625d52]"
                }`}
                onClick={() => setOnboardingStep(step)}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-[#f3efe4] p-4">
          <p className="text-base leading-7 text-[#3d3a32]">
            {onboardingCopy(onboardingStep)}
          </p>
          {onboardingStep === 2 && (
            <button
              className="mt-4 h-11 rounded-lg bg-[#e56f4f] px-4 text-sm font-black text-white"
              onClick={() => setAnalysisOn(!analysisOn)}
            >
              {analysisOn ? "분석 켜짐" : "성적 분석 켜기"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function GamesView({
  activeGame,
  completeGame,
  setActiveGame,
}: {
  activeGame: GameId;
  completeGame: (game: GameId, score: number, accuracy: number) => void;
  setActiveGame: (game: GameId) => void;
}) {
  return (
    <div className="grid gap-5 px-5 py-5 xl:grid-cols-[360px_1fr]">
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {["전체", "기억력", "언어", "작업 기억"].map((filter) => (
            <span
              className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] px-3 py-2 text-sm font-bold text-[#625d52]"
              key={filter}
            >
              {filter}
            </span>
          ))}
        </div>

        {games.map((game) => (
          <button
            className={`w-full rounded-lg border p-4 text-left transition ${
              activeGame === game.id
                ? "border-[#e56f4f] bg-[#fff3ec]"
                : "border-[#d8d1bf] bg-[#fffdf8] hover:border-[#9db29d]"
            }`}
            key={game.id}
            onClick={() => setActiveGame(game.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">{game.title}</h3>
                <p className="mt-1 text-sm text-[#625d52]">{game.description}</p>
              </div>
              <span className="rounded-lg bg-[#eef3e8] px-2 py-1 text-xs font-bold text-[#406044]">
                {game.area}
              </span>
            </div>
            <div className="mt-4 flex justify-between text-sm text-[#6d6658]">
              <span>{game.time}</span>
              <span>최고 {game.best}점</span>
              <span>{game.level}</span>
            </div>
          </button>
        ))}

        <div className="rounded-lg border border-[#d8d1bf] bg-[#f2f5e8] p-4">
          <p className="text-sm font-bold text-[#50673c]">이번 달 신작</p>
          <h3 className="mt-1 text-lg font-black">색깔 거짓말</h3>
          <p className="mt-2 text-sm leading-6 text-[#625d52]">
            글자 의미보다 실제 색을 빠르게 고르는 집중력 게임입니다.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
        {activeGame === "matching" && <MatchingGame completeGame={completeGame} />}
        {activeGame === "reverse" && <ReverseGame completeGame={completeGame} />}
        {activeGame === "word" && <WordGame completeGame={completeGame} />}
      </section>
    </div>
  );
}

function MatchingGame({
  completeGame,
}: {
  completeGame: (game: GameId, score: number, accuracy: number) => void;
}) {
  const [cards, setCards] = useState(() =>
    [...memorySymbols, ...memorySymbols]
      .map((symbol, index) => ({ id: index, symbol, matched: false }))
      .sort(() => Math.random() - 0.5),
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);

  function flipCard(index: number) {
    if (selected.includes(index) || cards[index].matched || selected.length === 2) {
      return;
    }

    const nextSelected = [...selected, index];
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      setTurns((current) => current + 1);
      const [first, second] = nextSelected;
      if (cards[first].symbol === cards[second].symbol) {
        const nextCards = cards.map((card, cardIndex) =>
          cardIndex === first || cardIndex === second
            ? { ...card, matched: true }
            : card,
        );
        setTimeout(() => {
          setCards(nextCards);
          setSelected([]);
          if (nextCards.every((card) => card.matched)) {
            const score = Math.max(62, 100 - turns * 7);
            completeGame("matching", score, Math.max(70, 100 - turns * 5));
          }
        }, 450);
      } else {
        setTimeout(() => setSelected([]), 650);
      }
    }
  }

  function reset() {
    setCards(
      [...memorySymbols, ...memorySymbols]
        .map((symbol, index) => ({ id: index, symbol, matched: false }))
        .sort(() => Math.random() - 0.5),
    );
    setSelected([]);
    setTurns(0);
  }

  return (
    <div>
      <GameHeader
        area="기억력"
        title="짝 찾기"
        detail="8장의 카드를 뒤집어 같은 그림을 모두 찾으세요."
        onReset={reset}
      />
      <div className="mt-5 grid max-w-xl grid-cols-4 gap-3">
        {cards.map((card, index) => {
          const open = selected.includes(index) || card.matched;
          return (
            <button
              className={`aspect-square rounded-lg border text-3xl font-black transition ${
                open
                  ? "border-[#5e7d68] bg-[#d7f0df] text-[#243b2f]"
                  : "border-[#d8d1bf] bg-[#243b2f] text-transparent"
              }`}
              key={card.id}
              onClick={() => flipCard(index)}
            >
              {card.symbol}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm font-bold text-[#625d52]">시도 횟수 {turns}</p>
    </div>
  );
}

function ReverseGame({
  completeGame,
}: {
  completeGame: (game: GameId, score: number, accuracy: number) => void;
}) {
  const [sequence, setSequence] = useState([4, 8, 2, 9]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  function refresh() {
    setSequence(
      Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1),
    );
    setAnswer("");
    setResult("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expected = [...sequence].reverse().join("");
    const normalized = answer.replace(/\D/g, "");
    const correctDigits = normalized
      .split("")
      .filter((digit, index) => digit === expected[index]).length;
    const accuracy = Math.round((correctDigits / expected.length) * 100);
    const score = normalized === expected ? 94 : Math.max(45, accuracy - 5);
    setResult(normalized === expected ? "정답입니다." : `정답은 ${expected}입니다.`);
    completeGame("reverse", score, accuracy);
  }

  return (
    <div>
      <GameHeader
        area="작업 기억"
        title="숫자 역주행"
        detail="보이는 숫자를 거꾸로 입력하세요."
        onReset={refresh}
      />
      <div className="mt-6 flex max-w-lg justify-center rounded-lg bg-[#243b2f] px-6 py-8 text-white">
        <p className="text-5xl font-black tracking-[0.2em]">
          {sequence.join(" ")}
        </p>
      </div>
      <form className="mt-5 flex max-w-lg gap-3" onSubmit={submit}>
        <input
          className="h-12 min-w-0 flex-1 rounded-lg border border-[#d8d1bf] bg-white px-4 text-lg font-bold outline-none focus:border-[#e56f4f]"
          inputMode="numeric"
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="거꾸로 입력"
          value={answer}
        />
        <button className="h-12 rounded-lg bg-[#e56f4f] px-5 text-sm font-black text-white">
          확인
        </button>
      </form>
      {result && <p className="mt-4 text-sm font-bold text-[#625d52]">{result}</p>}
    </div>
  );
}

function WordGame({
  completeGame,
}: {
  completeGame: (game: GameId, score: number, accuracy: number) => void;
}) {
  const [words, setWords] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const prompt = "시장";
  const samples = ["과일", "가격", "상인", "손님", "가게", "바구니"];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uniqueWords = Array.from(
      new Set(
        words
          .split(/[\s,]+/)
          .map((word) => word.trim())
          .filter((word) => word.length >= 2),
      ),
    );
    const sampleMatches = uniqueWords.filter((word) => samples.includes(word)).length;
    const score = Math.min(100, uniqueWords.length * 14 + sampleMatches * 6);
    setSubmitted(true);
    completeGame("word", Math.max(50, score), Math.min(100, uniqueWords.length * 12));
  }

  return (
    <div>
      <GameHeader
        area="언어감각"
        title="단어 사냥"
        detail="제시어와 관련된 단어를 쉼표나 띄어쓰기로 적어보세요."
        onReset={() => {
          setWords("");
          setSubmitted(false);
        }}
      />
      <div className="mt-5 max-w-xl rounded-lg bg-[#fff3ec] p-5">
        <p className="text-sm font-bold text-[#9a3e28]">제시어</p>
        <p className="mt-2 text-4xl font-black">{prompt}</p>
      </div>
      <form className="mt-5 max-w-xl" onSubmit={submit}>
        <textarea
          className="min-h-36 w-full resize-none rounded-lg border border-[#d8d1bf] bg-white p-4 text-base leading-7 outline-none focus:border-[#e56f4f]"
          onChange={(event) => setWords(event.target.value)}
          placeholder="예: 과일 가격 상인 손님"
          value={words}
        />
        <button className="mt-3 h-12 rounded-lg bg-[#e56f4f] px-5 text-sm font-black text-white">
          완료
        </button>
      </form>
      {submitted && (
        <p className="mt-4 text-sm font-bold text-[#625d52]">
          기록이 리포트에 반영되었습니다.
        </p>
      )}
    </div>
  );
}

function ReportView({
  analysisOn,
  needsPrecisionCheck,
  records,
  setAnalysisOn,
  setView,
  strongestArea,
  weeklyAverage,
}: {
  analysisOn: boolean;
  needsPrecisionCheck: boolean;
  records: PlayRecord[];
  setAnalysisOn: (value: boolean) => void;
  setView: (view: View) => void;
  strongestArea: Area;
  weeklyAverage: number;
}) {
  return (
    <div className="space-y-5 px-5 py-5">
      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold text-[#5e7d68]">주간 성적 변화</p>
              <h3 className="mt-1 text-2xl font-black">평균 {weeklyAverage}점</h3>
            </div>
            <p className="text-sm font-bold text-[#625d52]">
              강점 영역: {strongestArea}
            </p>
          </div>
          <div className="mt-6 flex h-64 items-end gap-3">
            {records.map((record, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={`${record.day}-${index}`}>
                <div className="flex h-48 w-full items-end rounded-lg bg-[#f0eadc] px-2">
                  <div
                    className="w-full rounded-lg bg-[#5e7d68]"
                    style={{ height: `${record.score}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#625d52]">{record.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-[#d8d1bf] bg-[#fffbec] p-5">
            <p className="text-sm font-bold text-[#766a43]">수면-성적 인사이트</p>
            <p className="mt-3 text-3xl font-black">+12%</p>
            <p className="mt-2 text-sm leading-6 text-[#625d52]">
              수면이 7시간 이상인 날 게임 성적이 더 높게 나타났습니다.
            </p>
          </div>
          <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
            <p className="text-sm font-bold text-[#5e7d68]">성적 분석</p>
            <p className="mt-2 text-lg font-black">
              {analysisOn ? "백그라운드 분석 중" : "동의 전"}
            </p>
            <button
              className="mt-4 h-11 rounded-lg border border-[#243b2f] px-4 text-sm font-black text-[#243b2f]"
              onClick={() => setAnalysisOn(!analysisOn)}
            >
              {analysisOn ? "분석 끄기" : "분석 켜기"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <p className="text-sm font-bold text-[#5e7d68]">인지 영역별 기록</p>
          <div className="mt-4 space-y-3">
            {records.slice(-5).map((record, index) => (
              <div className="grid grid-cols-[92px_1fr_52px] items-center gap-3" key={`${record.game}-${index}`}>
                <p className="text-sm font-bold">{record.area}</p>
                <div className="h-2 rounded-full bg-[#e9e1d0]">
                  <div
                    className="h-2 rounded-full bg-[#e56f4f]"
                    style={{ width: `${record.accuracy}%` }}
                  />
                </div>
                <p className="text-right text-sm font-bold">{record.accuracy}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#d8d1bf] bg-[#fff3ec] p-5">
          <p className="text-sm font-bold text-[#9a3e28]">두뇌 정밀 진단 모드</p>
          <h3 className="mt-2 text-2xl font-black">
            {needsPrecisionCheck ? "진입 가능" : "아직 잠겨 있음"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#625d52]">
            게임 성적 패턴 조건이 충족되면 표준 인지 테스트 화면으로 자연스럽게
            이어집니다. 데모에서는 조건 충족 상태를 리포트 점수로 판단합니다.
          </p>
          <button
            className={`mt-5 h-12 rounded-lg px-5 text-sm font-black ${
              needsPrecisionCheck
                ? "bg-[#243b2f] text-white"
                : "bg-[#d8d1bf] text-[#736b5d]"
            }`}
            disabled={!needsPrecisionCheck}
            onClick={() => setView("home")}
          >
            정밀 테스트 보기
          </button>
        </div>
      </section>
    </div>
  );
}

function WatchView({
  dailyAlerts,
  leisureNow,
  setDailyAlerts,
  setLeisureNow,
  setWatchOn,
  setWorkEnd,
  setWorkStart,
  watchOn,
  workEnd,
  workStart,
}: {
  dailyAlerts: number;
  leisureNow: boolean;
  setDailyAlerts: (value: number) => void;
  setLeisureNow: (value: boolean) => void;
  setWatchOn: (value: boolean) => void;
  setWorkEnd: (value: string) => void;
  setWorkStart: (value: string) => void;
  watchOn: boolean;
  workEnd: string;
  workStart: string;
}) {
  return (
    <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
        <p className="text-sm font-bold text-[#5e7d68]">여가 시간 감지 알림</p>
        <h3 className="mt-1 text-2xl font-black">
          {watchOn ? "워치 연동 켜짐" : "워치 연동 꺼짐"}
        </h3>

        <div className="mt-6 space-y-5">
          <SettingRow label="워치 감지">
            <Toggle checked={watchOn} onChange={setWatchOn} />
          </SettingRow>
          <SettingRow label="현재 여가 상태">
            <Toggle checked={leisureNow} onChange={setLeisureNow} />
          </SettingRow>
          <SettingRow label="하루 최대 알림">
            <input
              className="w-40 accent-[#e56f4f]"
              max="5"
              min="1"
              onChange={(event) => setDailyAlerts(Number(event.target.value))}
              type="range"
              value={dailyAlerts}
            />
            <span className="w-10 text-right text-sm font-black">{dailyAlerts}회</span>
          </SettingRow>
          <SettingRow label="업무 시간대">
            <input
              className="h-10 rounded-lg border border-[#d8d1bf] bg-white px-3 text-sm font-bold"
              onChange={(event) => setWorkStart(event.target.value)}
              type="time"
              value={workStart}
            />
            <span className="text-sm font-bold text-[#625d52]">부터</span>
            <input
              className="h-10 rounded-lg border border-[#d8d1bf] bg-white px-3 text-sm font-bold"
              onChange={(event) => setWorkEnd(event.target.value)}
              type="time"
              value={workEnd}
            />
            <span className="text-sm font-bold text-[#625d52]">까지</span>
          </SettingRow>
        </div>
      </section>

      <section className="rounded-lg border border-[#d8d1bf] bg-[#243b2f] p-5 text-white">
        <p className="text-sm font-bold text-[#cde5d5]">워치 미리보기</p>
        <div className="mx-auto mt-6 flex aspect-square max-w-64 flex-col items-center justify-center rounded-full border-8 border-[#1b2f24] bg-[#111b16] p-8 text-center shadow-xl">
          <p className="text-xs font-bold text-[#9db29d]">MindPick</p>
          <h3 className="mt-3 text-xl font-black">오늘의 두뇌 게임</h3>
          <p className="mt-3 text-sm leading-6 text-[#dcebe0]">
            지금 한 판 하기 좋은 상태입니다.
          </p>
          <button className="mt-5 h-10 rounded-lg bg-[#e56f4f] px-4 text-xs font-black text-white">
            짝 찾기
          </button>
        </div>
      </section>
    </div>
  );
}

function GameHeader({
  area,
  detail,
  onReset,
  title,
}: {
  area: Area;
  detail: string;
  onReset: () => void;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <span className="rounded-lg bg-[#eef3e8] px-3 py-1 text-sm font-bold text-[#406044]">
          {area}
        </span>
        <h3 className="mt-3 text-3xl font-black">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#625d52]">{detail}</p>
      </div>
      <button
        className="h-11 rounded-lg border border-[#d8d1bf] px-4 text-sm font-black text-[#3d3a32]"
        onClick={onReset}
      >
        다시 섞기
      </button>
    </div>
  );
}

function DashboardTile({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: "green" | "coral" | "yellow";
  value: string;
}) {
  const toneClass = {
    green: "bg-[#eef3e8] text-[#406044]",
    coral: "bg-[#fff3ec] text-[#9a3e28]",
    yellow: "bg-[#fffbec] text-[#766a43]",
  }[tone];

  return (
    <article className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
      <span className={`rounded-lg px-3 py-1 text-sm font-bold ${toneClass}`}>
        {label}
      </span>
      <p className="mt-5 text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#625d52]">{detail}</p>
    </article>
  );
}

function Metric({
  label,
  unit,
  value,
}: {
  label: string;
  unit: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white p-3 text-center">
      <p className="text-xs font-bold text-[#6d6658]">{label}</p>
      <p className="mt-1 text-xl font-black">
        {value}
        <span className="ml-1 text-xs font-bold">{unit}</span>
      </p>
    </div>
  );
}

function NavButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-11 rounded-lg px-3 text-sm font-black transition ${
        active
          ? "bg-[#243b2f] text-white"
          : "border border-[#d8d1bf] bg-white text-[#3d3a32] hover:border-[#9db29d]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d8d1bf] bg-white px-3 py-2">
      <p className="text-xs font-bold text-[#6d6658]">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

function SettingRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#eee6d7] pt-5 md:flex-row md:items-center md:justify-between">
      <p className="text-base font-black">{label}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className={`flex h-8 w-14 items-center rounded-full p-1 transition ${
        checked ? "bg-[#5e7d68]" : "bg-[#c9c1b1]"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`h-6 w-6 rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function viewTitle(view: View) {
  const titles: Record<View, string> = {
    games: "게임 센터",
    home: "오늘의 두뇌 트레이닝",
    report: "두뇌 건강 리포트",
    watch: "워치 연동 설정",
  };

  return titles[view];
}

function onboardingTitle(step: number) {
  if (step === 1) return "두뇌를 깨우는 일일 트레이닝";
  if (step === 2) return "게임 성적 기반 리포트 동의";
  return "전문 두뇌 테스트 고지";
}

function onboardingCopy(step: number) {
  if (step === 1) {
    return "앱 설치 직후에는 부담 없는 두뇌 트레이닝 게임으로 시작합니다. 워치 연동과 선호 게임만 고르면 홈 추천이 열립니다.";
  }

  if (step === 2) {
    return "7일 사용 후에는 게임 성적을 분석해 두뇌 건강 변화도 함께 추적할 수 있음을 알리고, 사용자가 동의할 때만 분석을 켭니다.";
  }

  return "정밀 테스트 권유 시점에는 인지 기능 점검을 위한 전문 도구라는 점을 명확히 고지합니다.";
}
