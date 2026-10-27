import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Loader2, Network } from 'lucide-react';
import useMembers from '../hooks/useMembers';
import SearchableSelect from '../components/SearchableSelect';
import { fullName, sortedByName } from '../utils/memberSave';

/**
 * Charts hub: pick any family member, then generate a shareable
 * descendant or ancestor chart image for them.
 */
const Charts: React.FC = () => {
  const navigate = useNavigate();
  const { members, loading } = useMembers();
  const [personId, setPersonId] = useState('');

  const options = useMemo(
    () => sortedByName(members).map((m) => ({ id: m.id, name: fullName(m) })),
    [members]
  );
  const selected = members.find((m) => m.id === personId) ?? null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Family Charts
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            Create a beautiful chart image for anyone in the family — ready to share on
            WhatsApp and social media.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <label htmlFor="charts-person-picker" className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
              Choose a person
            </label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading family members…
              </div>
            ) : (
              <SearchableSelect
                id="charts-person-picker"
                value={personId}
                onChange={setPersonId}
                options={options}
                emptyLabel="-- Select a family member --"
                placeholder="Find a person"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!selected}
              onClick={() => selected && navigate(`/chart/${selected.id}`)}
              className="min-h-[92px] rounded-2xl border-2 border-amber-600/70 bg-amber-50 dark:bg-amber-950/20 p-4 text-left disabled:opacity-40 disabled:border-gray-200 dark:disabled:border-zinc-800 disabled:bg-white dark:disabled:bg-zinc-900 transition"
            >
              <span className="flex items-center gap-2 font-extrabold text-gray-900 dark:text-white text-base">
                <Network className="w-5 h-5 text-amber-600" /> Descendants Chart
              </span>
              <span className="block text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                {selected ? `${fullName(selected)} at the top` : 'A person at the top'}, with their
                children, grandchildren and beyond below.
              </span>
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => selected && navigate(`/ancestors/${selected.id}`)}
              className="min-h-[92px] rounded-2xl border-2 border-amber-600/70 bg-amber-50 dark:bg-amber-950/20 p-4 text-left disabled:opacity-40 disabled:border-gray-200 dark:disabled:border-zinc-800 disabled:bg-white dark:disabled:bg-zinc-900 transition"
            >
              <span className="flex items-center gap-2 font-extrabold text-gray-900 dark:text-white text-base">
                <History className="w-5 h-5 text-amber-600" /> Ancestors Chart
              </span>
              <span className="block text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                {selected ? `${fullName(selected)} at the base` : 'A person at the base'}, with parents,
                grandparents and beyond above — siblings can be included too.
              </span>
            </button>
          </div>

          {!selected && !loading && (
            <p className="text-center text-xs text-gray-400 dark:text-zinc-500">
              Pick a person first — then choose which chart to generate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
