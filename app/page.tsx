"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

type View = "home" | "games" | "report" | "watch" | "precision";
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
  const [workStart, setWorkStart] = useState("10:30");
  const [workEnd, setWorkEnd] = useState("15:00");
  const [quickLullMode, setQuickLullMode] = useState(true);
  const [storeSignalOn, setStoreSignalOn] = useState(true);
  const [snoozed, setSnoozed] = useState(false);
  const [privateRanking, setPrivateRanking] = useState(true);
  const [splitTest, setSplitTest] = useState(true);
  const [reminderSlot, setReminderSlot] = useState("내일 15:30");

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
  const notificationReady = watchOn && leisureNow && !snoozed;

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

          <nav className="mt-5 grid grid-cols-5 gap-2 lg:grid-cols-1">
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
            <NavButton
              active={view === "precision"}
              label="정밀"
              onClick={() => setView("precision")}
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
              needsPrecisionCheck={needsPrecisionCheck}
              notificationReady={notificationReady}
              onboardingStep={onboardingStep}
              privateRanking={privateRanking}
              quickLullMode={quickLullMode}
              setActiveGame={setActiveGame}
              setAnalysisOn={setAnalysisOn}
              setOnboardingStep={setOnboardingStep}
              setPrivateRanking={setPrivateRanking}
              setView={setView}
              setWorkEnd={setWorkEnd}
              setWorkStart={setWorkStart}
              strongestArea={strongestArea}
              storeSignalOn={storeSignalOn}
              weeklyAverage={weeklyAverage}
              workEnd={workEnd}
              workStart={workStart}
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
              splitTest={splitTest}
              strongestArea={strongestArea}
              weeklyAverage={weeklyAverage}
            />
          )}

          {view === "watch" && (
            <WatchView
              dailyAlerts={dailyAlerts}
              leisureNow={leisureNow}
              quickLullMode={quickLullMode}
              setDailyAlerts={setDailyAlerts}
              setLeisureNow={setLeisureNow}
              setQuickLullMode={setQuickLullMode}
              setSnoozed={setSnoozed}
              setStoreSignalOn={setStoreSignalOn}
              setWatchOn={setWatchOn}
              setWorkEnd={setWorkEnd}
              setWorkStart={setWorkStart}
              snoozed={snoozed}
              storeSignalOn={storeSignalOn}
              watchOn={watchOn}
              workEnd={workEnd}
              workStart={workStart}
            />
          )}

          {view === "precision" && (
            <PrecisionView
              reminderSlot={reminderSlot}
              setReminderSlot={setReminderSlot}
              setSplitTest={setSplitTest}
              setView={setView}
              splitTest={splitTest}
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
  needsPrecisionCheck,
  notificationReady,
  onboardingStep,
  privateRanking,
  quickLullMode,
  setActiveGame,
  setAnalysisOn,
  setOnboardingStep,
  setPrivateRanking,
  setView,
  setWorkEnd,
  setWorkStart,
  strongestArea,
  storeSignalOn,
  weeklyAverage,
  workEnd,
  workStart,
}: {
  analysisOn: boolean;
  dailyAlerts: number;
  needsPrecisionCheck: boolean;
  notificationReady: boolean;
  onboardingStep: number;
  privateRanking: boolean;
  quickLullMode: boolean;
  setActiveGame: (game: GameId) => void;
  setAnalysisOn: (value: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setPrivateRanking: (value: boolean) => void;
  setView: (view: View) => void;
  setWorkEnd: (value: string) => void;
  setWorkStart: (value: string) => void;
  strongestArea: Area;
  storeSignalOn: boolean;
  weeklyAverage: number;
  workEnd: string;
  workStart: string;
}) {
  return (
    <div className="space-y-5 px-5 py-5">
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                {notificationReady && (
                  <span className="rounded-lg bg-[#d7f0df] px-3 py-1 text-sm font-bold text-[#1d5c39]">
                    {quickLullMode ? "짧은 소강 포착" : "지금 딱 좋은 타이밍"}
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
            {notificationReady
              ? storeSignalOn
                ? "매장 신호와 비활동 상태를 함께 보고 조용한 타이밍만 고릅니다."
                : "비활동 상태는 맞지만 위치 신호 없이 더 조심스럽게 판단합니다."
              : "지금은 알림을 쉬고 있어 추천 배지가 꺼져 있습니다."}
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
          value={needsPrecisionCheck ? "체크인 필요" : "대기"}
          detail={
            needsPrecisionCheck
              ? "바로 테스트보다 먼저 오늘 컨디션을 확인합니다."
              : "평소 게임은 그대로 즐기면 됩니다."
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
          {onboardingStep === 1 && (
            <div className="mt-4 grid gap-3 rounded-lg bg-white p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <p className="text-sm font-black">내 업무 시간</p>
              <input
                className="h-10 rounded-lg border border-[#d8d1bf] bg-white px-3 text-sm font-bold"
                onChange={(event) => setWorkStart(event.target.value)}
                type="time"
                value={workStart}
              />
              <input
                className="h-10 rounded-lg border border-[#d8d1bf] bg-white px-3 text-sm font-bold"
                onChange={(event) => setWorkEnd(event.target.value)}
                type="time"
                value={workEnd}
              />
            </div>
          )}
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

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <p className="text-sm font-bold text-[#5e7d68]">보상 지갑</p>
          <h3 className="mt-2 text-2xl font-black">이번 달 4,200P 전환 가능</h3>
          <div className="mt-4 h-2 rounded-full bg-[#e9e1d0]">
            <div className="h-2 rounded-full bg-[#5e7d68]" style={{ width: "84%" }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-[#625d52]">
            월 전환 한도 이후 포인트는 다음 달로 이월하거나 쿠폰으로 바꿀 수
            있습니다.
          </p>
        </div>

        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#5e7d68]">비교 설정</p>
              <h3 className="mt-2 text-2xl font-black">
                {privateRanking ? "내 기록만 보기" : "익명 평균과 비교"}
              </h3>
            </div>
            <Toggle checked={privateRanking} onChange={setPrivateRanking} />
          </div>
          <p className="mt-3 text-sm leading-6 text-[#625d52]">
            공개 비교 대신 비공개 기록을 기본값으로 두고, 원할 때만 익명 평균을
            참고합니다.
          </p>
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
  splitTest,
  strongestArea,
  weeklyAverage,
}: {
  analysisOn: boolean;
  needsPrecisionCheck: boolean;
  records: PlayRecord[];
  setAnalysisOn: (value: boolean) => void;
  setView: (view: View) => void;
  splitTest: boolean;
  strongestArea: Area;
  weeklyAverage: number;
}) {
  return (
    <div className="space-y-5 px-5 py-5">
      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold text-[#5e7d68]">이번 주 게임 리듬</p>
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
            <p className="text-sm font-bold text-[#766a43]">오늘의 쉬어가기</p>
            <p className="mt-3 text-3xl font-black">짧게 한 판</p>
            <p className="mt-2 text-sm leading-6 text-[#625d52]">
              바쁜 날에는 긴 목표보다 1분짜리 단어 사냥으로 가볍게 이어가면
              충분합니다.
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
          <p className="text-sm font-bold text-[#5e7d68]">강점 중심 기록</p>
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
          <p className="text-sm font-bold text-[#9a3e28]">요즘 컨디션 어때요?</p>
          <h3 className="mt-2 text-2xl font-black">
            {needsPrecisionCheck ? "먼저 컨디션 체크" : "가볍게 유지 중"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#625d52]">
            평소보다 덜 풀리는 날에는 바로 테스트로 넘기지 않고 피로, 바쁨,
            수면 같은 오늘 상태를 먼저 확인합니다.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["괜찮아요", "조금 피곤", "바빴어요"].map((label) => (
              <button
                className="h-10 rounded-lg border border-[#d8d1bf] bg-white text-xs font-black text-[#3d3a32]"
                key={label}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className={`mt-5 h-12 rounded-lg px-5 text-sm font-black ${
              needsPrecisionCheck
                ? "bg-[#243b2f] text-white"
                : "bg-[#d8d1bf] text-[#736b5d]"
            }`}
            disabled={!needsPrecisionCheck}
            onClick={() => setView("precision")}
          >
            {splitTest ? "나눠서 정밀 모드 보기" : "정밀 모드 보기"}
          </button>
        </div>
      </section>
    </div>
  );
}

function WatchView({
  dailyAlerts,
  leisureNow,
  quickLullMode,
  setDailyAlerts,
  setLeisureNow,
  setQuickLullMode,
  setSnoozed,
  setStoreSignalOn,
  setWatchOn,
  setWorkEnd,
  setWorkStart,
  snoozed,
  storeSignalOn,
  watchOn,
  workEnd,
  workStart,
}: {
  dailyAlerts: number;
  leisureNow: boolean;
  quickLullMode: boolean;
  setDailyAlerts: (value: number) => void;
  setLeisureNow: (value: boolean) => void;
  setQuickLullMode: (value: boolean) => void;
  setSnoozed: (value: boolean) => void;
  setStoreSignalOn: (value: boolean) => void;
  setWatchOn: (value: boolean) => void;
  setWorkEnd: (value: string) => void;
  setWorkStart: (value: string) => void;
  snoozed: boolean;
  storeSignalOn: boolean;
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
          <SettingRow label="짧은 소강상태">
            <Toggle checked={quickLullMode} onChange={setQuickLullMode} />
            <span className="text-sm font-bold text-[#625d52]">5~10분 비활동도 포착</span>
          </SettingRow>
          <SettingRow label="매장 신호 참고">
            <Toggle checked={storeSignalOn} onChange={setStoreSignalOn} />
            <span className="text-sm font-bold text-[#625d52]">Wi-Fi 위치로 오탐 줄이기</span>
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
          <SettingRow label="알림 상태">
            <button
              className={`h-10 rounded-lg px-4 text-sm font-black ${
                snoozed
                  ? "bg-[#d7f0df] text-[#1d5c39]"
                  : "bg-[#e56f4f] text-white"
              }`}
              onClick={() => setSnoozed(!snoozed)}
            >
              {snoozed ? "스누즈 해제" : "지금 바쁨"}
            </button>
          </SettingRow>
        </div>
      </section>

      <section className="rounded-lg border border-[#d8d1bf] bg-[#243b2f] p-5 text-white">
        <p className="text-sm font-bold text-[#cde5d5]">워치 미리보기</p>
        <div className="mx-auto mt-6 flex aspect-square max-w-64 flex-col items-center justify-center rounded-full border-8 border-[#1b2f24] bg-[#111b16] p-8 text-center shadow-xl">
          <p className="text-xs font-bold text-[#9db29d]">MindPick</p>
          <h3 className="mt-3 text-xl font-black">
            {snoozed ? "알림 쉬는 중" : "오늘의 두뇌 게임"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#dcebe0]">
            {snoozed
              ? "손님 응대 중에는 조용히 기다립니다."
              : "지금 한 판 하기 좋은 상태입니다."}
          </p>
          <div className="mt-5 grid w-full gap-2">
            <button className="h-10 rounded-lg bg-[#e56f4f] px-4 text-xs font-black text-white">
              짝 찾기
            </button>
            <button
              className="h-10 rounded-lg bg-white/10 px-4 text-xs font-black text-white ring-1 ring-white/20"
              onClick={() => setSnoozed(true)}
            >
              지금 바쁨
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PrecisionView({
  reminderSlot,
  setReminderSlot,
  setSplitTest,
  setView,
  splitTest,
}: {
  reminderSlot: string;
  setReminderSlot: (value: string) => void;
  setSplitTest: (value: boolean) => void;
  setView: (view: View) => void;
  splitTest: boolean;
}) {
  return (
    <div className="space-y-5 px-5 py-5">
      <section className="rounded-lg border border-[#b9c3bd] bg-[#f8fbf9] p-5">
        <p className="text-sm font-bold text-[#486052]">정밀 모드</p>
        <h3 className="mt-2 text-3xl font-black">평소 게임과 분리해서 진행</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5b655d]">
          이 화면에서만 전문 점검 안내를 보여주고, 게임 센터의 난이도와 보상
          흐름은 그대로 둡니다.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-[#d8d1bf] bg-[#fffdf8] p-5">
          <p className="text-sm font-bold text-[#5e7d68]">진행 방식</p>
          <div className="mt-5 space-y-4">
            <SettingRow label="세션 나눠서 진행">
              <Toggle checked={splitTest} onChange={setSplitTest} />
              <span className="text-sm font-bold text-[#625d52]">
                3분 + 3분 + 2분
              </span>
            </SettingRow>
            <SettingRow label="리마인드 예약">
              <select
                className="h-10 rounded-lg border border-[#d8d1bf] bg-white px-3 text-sm font-bold"
                onChange={(event) => setReminderSlot(event.target.value)}
                value={reminderSlot}
              >
                <option>내일 15:30</option>
                <option>오늘 20:00</option>
                <option>주말 오전</option>
              </select>
            </SettingRow>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["1", "기억 단어", "약 3분"],
              ["2", "시계 그리기", "약 3분"],
              ["3", "다시 떠올리기", "약 2분"],
            ].map(([step, title, time]) => (
              <article
                className="rounded-lg border border-[#d8d1bf] bg-white p-4"
                key={step}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#243b2f] text-sm font-black text-white">
                  {step}
                </span>
                <h4 className="mt-3 text-base font-black">{title}</h4>
                <p className="mt-1 text-sm font-bold text-[#625d52]">{time}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#d8d1bf] bg-[#fff3ec] p-5">
          <p className="text-sm font-bold text-[#9a3e28]">예약됨</p>
          <h3 className="mt-2 text-2xl font-black">{reminderSlot}</h3>
          <p className="mt-3 text-sm leading-6 text-[#625d52]">
            짧고 불규칙한 여유 시간에는 바로 시작하지 않고, 한가한 시간으로
            미룰 수 있습니다.
          </p>
          <div className="mt-5 grid gap-2">
            <button className="h-12 rounded-lg bg-[#243b2f] px-5 text-sm font-black text-white">
              첫 세션 시작
            </button>
            <button
              className="h-12 rounded-lg border border-[#d8d1bf] bg-white px-5 text-sm font-black text-[#3d3a32]"
              onClick={() => setView("games")}
            >
              평소 게임으로 돌아가기
            </button>
          </div>
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
    precision: "두뇌 정밀 모드",
    report: "게임 실력 리포트",
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
    return "처음에는 플레이 시간과 알림 시간대를 꼭 맞춥니다. 자영업자처럼 하루 흐름이 일정하지 않아도 오후 소강 시간을 놓치지 않도록 업무 시간을 직접 고릅니다.";
  }

  if (step === 2) {
    return "7일 뒤에는 게임 실력 변화를 더 자세히 보여드릴지 묻습니다. 어려운 표현보다 내가 어떤 게임에 강한지, 어떤 날 잘 풀리는지를 중심으로 보여줍니다.";
  }

  return "정밀 테스트는 일반 게임과 분리된 화면에서만 안내합니다. 평소 게임 화면과 보상 흐름은 그대로 유지됩니다.";
}
