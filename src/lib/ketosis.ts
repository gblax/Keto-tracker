export type KetosisState = 'in_ketosis' | 'transitioning' | 'out_of_ketosis' | 'unknown';

export interface DayTotalInput {
  date: string;
  netCarbs: number;
  complete: boolean;
}

export interface KetosisOptions {
  threshold: number;
  streakForKetosis: number;
  graceDays: number;
}

export interface KetosisResult {
  state: KetosisState;
  streakDays: number;
  todayNetCarbs: number;
  todayOver: boolean;
  label: string;
}

export function computeKetosis(
  dayTotalsNewestFirst: DayTotalInput[],
  opts: KetosisOptions,
): KetosisResult {
  const today = dayTotalsNewestFirst[0];
  const prior = dayTotalsNewestFirst.slice(1).filter((d) => d.complete);

  let streak = 0;
  let grace = opts.graceDays;
  for (const d of prior) {
    if (d.netCarbs <= opts.threshold) {
      streak++;
      continue;
    }
    if (grace > 0 && streak > 0) {
      grace--;
      continue;
    }
    break;
  }

  const todayUnder = today ? today.netCarbs <= opts.threshold : true;
  const todayOver = !!today && !todayUnder;

  let state: KetosisState;
  if (prior.length < opts.streakForKetosis) {
    state = todayOver ? 'out_of_ketosis' : 'unknown';
  } else if (todayOver) {
    state = streak >= opts.streakForKetosis ? 'transitioning' : 'out_of_ketosis';
  } else if (streak >= opts.streakForKetosis) {
    state = 'in_ketosis';
  } else if (streak >= 1) {
    state = 'transitioning';
  } else {
    state = 'out_of_ketosis';
  }

  const displayStreak = todayOver ? streak : streak + (today && todayUnder ? 1 : 0);
  const label =
    displayStreak > 0 ? `Day ${displayStreak} under ${opts.threshold}g` : 'Streak broken';

  return {
    state,
    streakDays: streak,
    todayNetCarbs: today?.netCarbs ?? 0,
    todayOver,
    label,
  };
}

export function ketosisStateLabel(state: KetosisState): string {
  switch (state) {
    case 'in_ketosis':
      return 'Likely in ketosis';
    case 'transitioning':
      return 'Transitioning';
    case 'out_of_ketosis':
      return 'Out of ketosis';
    case 'unknown':
      return 'Gathering data';
  }
}

export function ketosisStateTone(state: KetosisState): 'good' | 'warn' | 'bad' | 'muted' {
  switch (state) {
    case 'in_ketosis':
      return 'good';
    case 'transitioning':
      return 'warn';
    case 'out_of_ketosis':
      return 'bad';
    case 'unknown':
      return 'muted';
  }
}
