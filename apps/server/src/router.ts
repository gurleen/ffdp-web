import { os } from "@orpc/server";
import { supabase } from "./lib/supabase";

const ping = os.handler(async () => {
  return { message: "pong", time: new Date().toISOString() };
});

const leagueStandings = os.handler(async () => {
  const { data: leagues, error: leaguesError } = await supabase
    .from("league")
    .select("league_key, display_name")
    .order("display_name");
  if (leaguesError) throw leaguesError;

  const results = await Promise.all(
    (leagues ?? []).map(async (league) => {
      const { data: season, error: seasonError } = await supabase
        .from("league_season")
        .select("id, season, name, num_teams, status")
        .eq("league_key", league.league_key)
        .order("season", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (seasonError) throw seasonError;
      if (!season) return null;

      const { data: franchises, error: franchisesError } = await supabase
        .from("franchise")
        .select("id, name, abbrev, manager_id, wins, losses, ties, points_for, points_against")
        .eq("league_season_id", season.id)
        .order("wins", { ascending: false })
        .order("points_for", { ascending: false });
      if (franchisesError) throw franchisesError;

      const managerIds = [
        ...new Set(
          (franchises ?? [])
            .map((franchise) => franchise.manager_id)
            .filter((id): id is number => id !== null),
        ),
      ];

      const managerNames = new Map<number, string>();
      if (managerIds.length > 0) {
        const { data: managers, error: managersError } = await supabase
          .from("manager")
          .select("id, display_name")
          .in("id", managerIds);
        if (managersError) throw managersError;
        for (const manager of managers ?? []) managerNames.set(manager.id, manager.display_name);
      }

      return {
        leagueKey: league.league_key,
        displayName: league.display_name,
        season: season.season,
        seasonName: season.name,
        numTeams: season.num_teams,
        status: season.status,
        standings: (franchises ?? []).map((franchise) => ({
          id: franchise.id,
          name: franchise.name,
          abbrev: franchise.abbrev,
          managerName:
            franchise.manager_id !== null ? (managerNames.get(franchise.manager_id) ?? null) : null,
          wins: franchise.wins ?? 0,
          losses: franchise.losses ?? 0,
          ties: franchise.ties ?? 0,
          pointsFor: franchise.points_for,
          pointsAgainst: franchise.points_against,
        })),
      };
    }),
  );

  return results.filter((result): result is NonNullable<typeof result> => result !== null);
});

export const router = {
  ping,
  leagueStandings,
};

export type AppRouter = typeof router;
