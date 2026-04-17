'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUpdateChecklist } from '@/hooks/use-implementation';
import type { DeploymentArtifact } from '@/types';

interface ArtifactViewerProps {
  artifact: DeploymentArtifact;
  onBack: () => void;
}

/** Extract zero-based line indices that are markdown checklist items */
function extractChecklistIndices(content: string): number[] {
  return content.split('\n').reduce<number[]>((acc, line, idx) => {
    if (/^\s*-\s*\[[ x]\]/i.test(line)) acc.push(idx);
    return acc;
  }, []);
}

export function ArtifactViewer({ artifact, onBack }: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false);
  const updateChecklist = useUpdateChecklist();

  const checklistIndices = useMemo(
    () => extractChecklistIndices(artifact.content),
    [artifact.content],
  );

  const checklistState = (artifact.checklistState ?? {}) as Record<
    string,
    boolean
  >;

  const isChecklist = artifact.type === 'INTEGRATION_CHECKLIST';
  const totalItems = checklistIndices.length;
  const checkedItems = checklistIndices.filter(
    (idx) => checklistState[idx],
  ).length;

  // Build content with server state applied so markdown renders correct checks
  const renderedContent = useMemo(() => {
    if (!isChecklist || totalItems === 0) return artifact.content;

    const lines = artifact.content.split('\n');
    for (const idx of checklistIndices) {
      if (checklistState[idx]) {
        lines[idx] = lines[idx].replace(/\[[ ]\]/i, '[x]');
      } else {
        lines[idx] = lines[idx].replace(/\[[x]\]/i, '[ ]');
      }
    }
    return lines.join('\n');
  }, [artifact.content, checklistState, checklistIndices, isChecklist, totalItems]);

  // Track which line index each rendered <input> corresponds to
  const checkboxLineMap = useMemo(() => {
    if (!isChecklist) return [];
    return [...checklistIndices];
  }, [isChecklist, checklistIndices]);

  const handleCheckboxToggle = useCallback(
    (renderIndex: number) => {
      const lineIndex = checkboxLineMap[renderIndex];
      if (lineIndex === undefined) return;

      const currentlyChecked = !!checklistState[lineIndex];
      updateChecklist.mutate(
        {
          artifactId: artifact.id,
          lineIndex,
          checked: !currentlyChecked,
        },
        {
          onError: () => toast.error('Failed to update checklist'),
        },
      );
    },
    [checkboxLineMap, checklistState, artifact.id, updateChecklist],
  );

  function handleCopy() {
    navigator.clipboard.writeText(artifact.content).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Custom checkbox renderer — intercepts GFM task list inputs
  let checkboxCounter = 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Plan
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 mr-1.5" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#1C1917]">{artifact.title}</h2>
        <p className="text-xs text-[#A8A29E] mt-0.5">
          {artifact.type.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Progress bar for checklists */}
      {isChecklist && totalItems > 0 && (
        <div className="rounded-lg border border-[#E7E5E4] bg-white px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#57534E]">
              Progress
            </span>
            <span className="text-xs font-semibold text-[#1C1917]">
              {checkedItems}/{totalItems} items
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#F5F5F4] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%`,
              }}
            />
          </div>
          {checkedItems === totalItems && (
            <p className="text-xs text-emerald-600 font-medium mt-2">
              All items completed — ready to deploy
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] p-6 overflow-auto">
        <div className="prose prose-sm prose-stone max-w-none text-sm text-[#1C1917] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={
              isChecklist
                ? {
                    input: (props) => {
                      if (props.type !== 'checkbox') {
                        return <input {...props} />;
                      }
                      const idx = checkboxCounter++;
                      const lineIdx = checkboxLineMap[idx];
                      const isChecked = lineIdx !== undefined && !!checklistState[lineIdx];
                      return (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(idx)}
                          className="mr-2 h-4 w-4 rounded border-stone-300 text-emerald-600 cursor-pointer accent-emerald-600"
                        />
                      );
                    },
                  }
                : undefined
            }
          >
            {renderedContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
