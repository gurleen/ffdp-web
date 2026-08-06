import { Badge, DataGrid, Panel, Spinner } from "@gurleen-ui/core";
import { useEffect, useState } from "react";
import { orpc } from "./lib/orpc";

type LeagueStandings = Awaited<ReturnType<typeof orpc.leagueStandings>>[number];

function formatPoints(points: number | null) {
  return points === null ? "—" : points.toFixed(1);
}

function LeagueCard({ league }: { league: LeagueStandings }) {
  const rows = league.standings.map((standing, index) => ({
    rank: index + 1,
    team: standing.abbrev ? `${standing.name} (${standing.abbrev})` : (standing.name ?? "—"),
    manager: standing.managerName ?? "—",
    record: `${standing.wins}-${standing.losses}-${standing.ties}`,
    pointsFor: formatPoints(standing.pointsFor),
    pointsAgainst: formatPoints(standing.pointsAgainst),
  }));

  return (
    <Panel
      title={league.displayName}
      meta={`${league.season} season`}
      actions={league.status ? <Badge kind="neutral" label={league.status} /> : undefined}
      padded={false}
    >
      <DataGrid
        columns={[
          { key: "rank", label: "#", width: "32px", align: "right", dim: true },
          { key: "team", label: "Team" },
          { key: "manager", label: "Manager" },
          { key: "record", label: "W-L-T", width: "80px", align: "right" },
          { key: "pointsFor", label: "PF", width: "70px", align: "right", dim: true },
          { key: "pointsAgainst", label: "PA", width: "70px", align: "right", dim: true },
        ]}
        rows={rows}
      />
    </Panel>
  );
}

export function App() {
  const [leagues, setLeagues] = useState<LeagueStandings[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orpc
      .leagueStandings()
      .then(setLeagues)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load leagues.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold">ffdp-web</h1>
          <p className="text-sm text-neutral-400">Fantasy football tracker</p>
        </div>

        {error && (
          <Panel title="Error">
            <p className="text-sm text-neutral-300">{error}</p>
          </Panel>
        )}

        {!error && !leagues && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Spinner /> Loading leagues…
          </div>
        )}

        {!error && leagues?.length === 0 && (
          <p className="text-sm text-neutral-400">No leagues found.</p>
        )}

        {leagues?.map((league) => (
          <LeagueCard key={league.leagueKey} league={league} />
        ))}
      </div>
    </div>
  );
}
