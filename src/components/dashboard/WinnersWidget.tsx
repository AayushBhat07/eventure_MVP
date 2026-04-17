import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const rankColors: Record<string, string> = {
  "1st": "bg-yellow-400 text-black",
  "2nd": "bg-gray-300 text-black",
  "3rd": "bg-amber-600 text-white",
};

export function WinnersWidget() {
  const winners = useQuery(api.events.getAllWinnersWithEvents);

  if (winners === undefined) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black dark:border-white" />
      </div>
    );
  }

  if (!winners || winners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Trophy className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-bold text-muted-foreground uppercase">No winners yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {winners.map((winner: any, i: number) => {
        const rankColor = rankColors[winner.rank] || "bg-blue-400 text-black";
        return (
          <motion.div
            key={winner._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] overflow-hidden bg-white dark:bg-neutral-900"
          >
            {winner.photoUrl ? (
              <div className="aspect-square overflow-hidden border-b-2 border-black dark:border-white">
                <img src={winner.photoUrl} alt={winner.winnerName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`aspect-square flex items-center justify-center border-b-2 border-black dark:border-white ${rankColor}`}>
                <Trophy className="h-8 w-8" />
              </div>
            )}
            <div className="p-2">
              <span className={`inline-block px-1.5 py-0.5 text-[9px] font-black uppercase border border-black dark:border-white mb-1 ${rankColor}`}>
                {winner.rank}
              </span>
              <p className="text-xs font-black uppercase truncate leading-tight">{winner.winnerName}</p>
              <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{winner.eventName}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
