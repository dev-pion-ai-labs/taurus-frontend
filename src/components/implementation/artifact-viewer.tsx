'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { DeploymentArtifact } from '@/types';

interface ArtifactViewerProps {
  artifact: DeploymentArtifact;
  onBack: () => void;
}

export function ArtifactViewer({ artifact, onBack }: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(artifact.content).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

      {/* Content */}
      <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] p-6 overflow-auto">
        <div className="prose prose-sm prose-stone max-w-none whitespace-pre-wrap text-sm text-[#1C1917] leading-relaxed">
          {artifact.content}
        </div>
      </div>
    </div>
  );
}
