'use client';

import React, { useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { TransformationReport } from '@/types';

export function PdfExportButton({
  report,
}: {
  reportRef?: React.RefObject<HTMLDivElement | null>;
  report: TransformationReport;
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await fetch(
        `/api/v1/consultation/sessions/${report.sessionId}/report/export`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taurus-ai-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report exported as PDF');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [report.sessionId]);

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      className="gap-2 rounded-full border-[#E7E5E4] bg-white px-5 text-[13px] font-medium text-[#1C1917] shadow-sm hover:bg-[#F5F5F4]"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
