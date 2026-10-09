"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  GitBranch,
  Search,
} from "lucide-react";

type GitCommand = {
  command: string;
  description: string;
  category: "Undo & Recovery" | "Branching & Merging" | "Stashing & Cleaning" | "History & Inspection" | "Remote & Sync";
  caution?: boolean;
};

const COMMANDS: GitCommand[] = [
  // Undo & Recovery
  { command: "git reset --soft HEAD~1", description: "Undo latest commit but keep all modified changes staged in index.", category: "Undo & Recovery" },
  { command: "git reset --mixed HEAD~1", description: "Undo latest commit and unstage changes, keeping them in working tree.", category: "Undo & Recovery" },
  { command: "git reset --hard HEAD~1", description: "Completely discard latest commit and all uncommitted working changes.", category: "Undo & Recovery", caution: true },
  { command: "git restore --staged <file>", description: "Unstage a specific file while keeping your edits intact.", category: "Undo & Recovery" },
  { command: "git restore <file>", description: "Discard unstaged modifications in working directory for a specific file.", category: "Undo & Recovery", caution: true },
  { command: "git commit --amend --no-edit", description: "Combine currently staged files into the previous commit without changing message.", category: "Undo & Recovery" },
  { command: "git reflog", description: "Show log of all HEAD pointer movements; recover orphaned or lost commits.", category: "Undo & Recovery" },

  // Branching & Merging
  { command: "git switch -c <new-branch>", description: "Create a new branch and switch to it immediately.", category: "Branching & Merging" },
  { command: "git branch -d <branch>", description: "Delete a local branch safely (must already be merged upstream).", category: "Branching & Merging" },
  { command: "git branch -D <branch>", description: "Force delete a local branch regardless of merge status.", category: "Branching & Merging", caution: true },
  { command: "git merge --no-ff <branch>", description: "Merge target branch creating an explicit merge commit.", category: "Branching & Merging" },
  { command: "git rebase -i HEAD~<n>", description: "Interactively squash, reword, drop, or edit the last n commits.", category: "Branching & Merging" },
  { command: "git cherry-pick <commit-hash>", description: "Apply changes from an existing commit on another branch onto current HEAD.", category: "Branching & Merging" },

  // Stashing & Cleaning
  { command: "git stash push -m '<message>'", description: "Stash modified working directory changes with a descriptive label.", category: "Stashing & Cleaning" },
  { command: "git stash list", description: "Inspect all stashed change sets currently saved in the repository.", category: "Stashing & Cleaning" },
  { command: "git stash pop", description: "Apply the latest stash item and remove it from the stash stack.", category: "Stashing & Cleaning" },
  { command: "git stash apply stash@{n}", description: "Apply a specific stashed change set without deleting it from stash.", category: "Stashing & Cleaning" },
  { command: "git clean -fd", description: "Forcefully remove all untracked files and untracked directories.", category: "Stashing & Cleaning", caution: true },

  // History & Inspection
  { command: "git log --oneline --graph --decorate --all", description: "Visual ASCII diagram of all branches, commits, and tags.", category: "History & Inspection" },
  { command: "git diff --staged", description: "Show differences between staged index changes and latest commit.", category: "History & Inspection" },
  { command: "git log -p -2", description: "Show the patch/diff introduced by each of the last 2 commits.", category: "History & Inspection" },
  { command: "git blame -L 1,15 <file>", description: "Inspect commit author and timestamp line-by-line for lines 1 to 15.", category: "History & Inspection" },

  // Remote & Sync
  { command: "git fetch --prune", description: "Fetch remote state and clean up deleted tracking references.", category: "Remote & Sync" },
  { command: "git push origin --delete <branch>", description: "Delete a remote branch on GitHub/GitLab origin.", category: "Remote & Sync" },
  { command: "git push --force-with-lease", description: "Safely force push ensuring no remote commits from peers are overwritten.", category: "Remote & Sync", caution: true },
  { command: "git remote prune origin", description: "Remove dead remote-tracking branches that no longer exist on remote.", category: "Remote & Sync" },
];

export default function GitCheatsheetPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = ["All", "Undo & Recovery", "Branching & Merging", "Stashing & Cleaning", "History & Inspection", "Remote & Sync"];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COMMANDS.filter((c) => {
      const matchQuery = c.command.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchCat = category === "All" || c.category === category;
      return matchQuery && matchCat;
    });
  }, [search, category]);

  const handleCopy = async (cmd: string) => {
    await navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between py-8 px-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 bg-[#0a0b0e] border border-zinc-800 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Vault</span>
            </Link>
            <h1 className="text-sm font-bold text-white tracking-wide uppercase">
              Git Command & Workflow Reference
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {COMMANDS.length} Workflows & Recipes
          </span>
        </header>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-3 mb-6">
          <div className="flex flex-wrap gap-1 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs transition-colors border ${
                  category === cat
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-black border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border border-zinc-800 bg-black px-2.5 py-1.5 w-full sm:w-64">
            <Search size={14} className="text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search git commands..."
              className="bg-transparent text-xs text-zinc-200 outline-none w-full font-mono"
            />
          </div>
        </div>

        {/* Command Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0a0b0e] border border-zinc-800 p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                    {item.category}
                  </span>
                  {item.caution && (
                    <span className="text-[9px] font-mono uppercase bg-red-950/40 border border-red-800 text-red-400 px-1.5 py-0.5">
                      Destructive
                    </span>
                  )}
                </div>

                <div className="bg-black border border-zinc-900 p-2.5 font-mono text-xs text-blue-400 flex items-center justify-between gap-2 select-all mb-2.5">
                  <code className="break-all">{item.command}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.command)}
                    className="text-zinc-500 hover:text-white shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd === item.command ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Git Command Reference
      </footer>
    </div>
  );
}