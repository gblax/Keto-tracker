import { describe, it, expect } from 'vitest';
import { computeKetosis, type DayTotalInput } from './ketosis';

const OPTS = { threshold: 20, streakForKetosis: 3, graceDays: 1 };

function days(seq: [string, number, boolean?][]): DayTotalInput[] {
  return seq.map(([date, netCarbs, complete = true]) => ({ date, netCarbs, complete }));
}

describe('computeKetosis', () => {
  it('returns unknown when there is insufficient data', () => {
    const r = computeKetosis(days([['2026-04-20', 12, false]]), OPTS);
    expect(r.state).toBe('unknown');
  });

  it('reports in_ketosis after 3 consecutive under-threshold completed days', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 15, false],
        ['2026-04-19', 18, true],
        ['2026-04-18', 10, true],
        ['2026-04-17', 19, true],
      ]),
      OPTS,
    );
    expect(r.state).toBe('in_ketosis');
    expect(r.streakDays).toBe(3);
    expect(r.label).toBe('Day 4 under 20g');
  });

  it('today over threshold drops in_ketosis to transitioning when streak qualifies', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 45, false],
        ['2026-04-19', 18, true],
        ['2026-04-18', 10, true],
        ['2026-04-17', 19, true],
      ]),
      OPTS,
    );
    expect(r.state).toBe('transitioning');
    expect(r.todayOver).toBe(true);
  });

  it('out_of_ketosis when no recent under days', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 60, false],
        ['2026-04-19', 80, true],
        ['2026-04-18', 70, true],
        ['2026-04-17', 90, true],
      ]),
      OPTS,
    );
    expect(r.state).toBe('out_of_ketosis');
    expect(r.streakDays).toBe(0);
  });

  it('transitioning with only one under day', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 10, false],
        ['2026-04-19', 15, true],
        ['2026-04-18', 80, true],
        ['2026-04-17', 90, true],
      ]),
      OPTS,
    );
    expect(r.state).toBe('transitioning');
  });

  it('tolerates one grace-day blip mid-streak', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 10, false],
        ['2026-04-19', 15, true],
        ['2026-04-18', 18, true],
        ['2026-04-17', 25, true], // grace-day blip
        ['2026-04-16', 12, true],
        ['2026-04-15', 18, true],
      ]),
      OPTS,
    );
    expect(r.state).toBe('in_ketosis');
    expect(r.streakDays).toBeGreaterThanOrEqual(3);
  });

  it('two consecutive over-days break the streak', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 10, false],
        ['2026-04-19', 18, true],
        ['2026-04-18', 50, true],
        ['2026-04-17', 60, true],
        ['2026-04-16', 15, true],
      ]),
      OPTS,
    );
    expect(r.streakDays).toBe(1);
    expect(r.state).toBe('transitioning');
  });

  it('ignores in-progress day from streak prior count', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 5, false],
        ['2026-04-19', 18, true],
        ['2026-04-18', 12, true],
      ]),
      OPTS,
    );
    expect(r.streakDays).toBe(2);
  });

  it('today exactly at threshold counts as under', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 20, false],
        ['2026-04-19', 20, true],
        ['2026-04-18', 20, true],
        ['2026-04-17', 20, true],
      ]),
      OPTS,
    );
    expect(r.state).toBe('in_ketosis');
  });

  it('unknown streak of 1 with very little history', () => {
    const r = computeKetosis(
      days([
        ['2026-04-20', 8, false],
        ['2026-04-19', 10, true],
      ]),
      OPTS,
    );
    expect(r.state).toBe('unknown');
  });
});
